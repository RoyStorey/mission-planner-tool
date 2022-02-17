<template>
  <div class="content">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-breadcrumb>
        <n-breadcrumb-item href="#" style="font-size: 24px">
          <router-link to="/missions"> Missions </router-link>
        </n-breadcrumb-item>
        <n-breadcrumb-item href="#" style="font-size: 24px">
          #{{ $route.params.missionId }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </n-h1>
    <n-card title="Mission Details">
      <template #header-extra>
        <n-popover v-if="!editEnabled" :show-arrow="false" trigger="hover">
          <template #trigger>
            <n-a @click="toggleEdit">
              <n-icon size="20">
                <create-outline />
              </n-icon>
            </n-a>
          </template>
          <span>Edit Mission</span>
        </n-popover>
        <n-space v-else>
          <n-button
            type="error"
            :loading="loadingDelete"
            @click="deleteMission"
          >
            Delete
          </n-button>
          <n-button
            type="primary"
            @click="updateMission"
            :loading="loadingEdit"
          >
            Save
          </n-button>
        </n-space>
      </template>
      <n-descriptions v-if="!editEnabled" label-placement="top">
        <n-descriptions-item label="Travel Dates">
          {{ dayjs.utc(missionData?.dd_zulu).format("MM/DD/YYYY HH:mm") }} -
          {{ dayjs.utc(missionData?.arrival_date).format("MM/DD/YYYY HH:mm") }}
        </n-descriptions-item>
        <n-descriptions-item label="Locations">
          {{ missionData?.from }} <n-icon><arrow-forward /></n-icon>
          {{ missionData?.to }} ({{ missionData?.airport }})
        </n-descriptions-item>
        <n-descriptions-item label="Dead Head">
          {{ missionData?.dh ? "YES" : "NO" }}
        </n-descriptions-item>
        <n-descriptions-item label="Mission Number">
          {{ missionData?.mission_number }}
        </n-descriptions-item>
        <n-descriptions-item label="Ground Time">
          {{ missionData?.gnd_time }}
        </n-descriptions-item>
      </n-descriptions>
      <n-form
        :rules="rules"
        :label-width="80"
        :model="formValue"
        size="medium"
        ref="formRef"
        v-else
      >
        <n-grid :span="24" :x-gap="24">
          <n-form-item-gi :span="12" label="Departure Date (z)" path="dd_zulu">
            <n-date-picker
              v-model:value="formValue.dd_zulu"
              type="datetime"
              style="width: 100%"
            />
          </n-form-item-gi>
          <n-form-item-gi
            :span="12"
            label="Arrival Date (z)"
            path="arrival_date"
          >
            <n-date-picker
              v-model:value="formValue.arrival_date"
              type="datetime"
              style="width: 100%"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="5" label="From" path="from">
            <n-input v-model:value="formValue.from" />
          </n-form-item-gi>
          <n-form-item-gi :span="5" label="To" path="to">
            <n-input v-model:value="formValue.to" />
          </n-form-item-gi>
          <n-form-item-gi :span="5" label="Airport" path="airport">
            <n-input v-model:value="formValue.airport" />
          </n-form-item-gi>
          <n-form-item-gi :span="5" label="Ground Time" path="gnd_time">
            <n-input v-model:value="formValue.gnd_time" />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="Dead Head" path="dh">
            <n-switch v-model:value="formValue.dh" />
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>
    <n-grid style="margin: 1em 0" :cols="4">
      <n-grid-item :span="1">
        <n-card title="Add Entry">
          <n-form
            :rules="entryRules"
            :label-width="80"
            :model="entryValue"
            size="medium"
            ref="entryRef"
          >
            <n-form-item label="Entry" path="entry">
              <n-input
                type="textarea"
                clearable
                v-model:value="entryValue.entry"
                @keyup.enter="addEntry"
              />
            </n-form-item>
            <n-button
              type="primary"
              style="float: right"
              :loading="loadingEntry"
              @click="addEntry"
              >Save</n-button
            >
          </n-form>
        </n-card>
      </n-grid-item>
      <n-grid-item :span="3" style="padding-left: 1em">
        <n-h2>Mission Timeline</n-h2>
        <n-timeline id="timeline" style="max-height: 350px; overflow: auto">
          <n-timeline-item type="success" content="Mission start." />
          <n-timeline-item
            v-bind:key="entry.id"
            v-for="entry in entries"
            :title="entry.entry"
            :time="dayjs.utc(entry.time).format('MM/DD/YYYY HH:mm')"
          />
        </n-timeline>
      </n-grid-item>
    </n-grid>
    <n-card title="Export Mission">
      <n-input type="textarea" v-model:value="finalText" />
    </n-card>
  </div>
</template>

<script>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  NH1,
  NH2,
  NCard,
  NBreadcrumb,
  NBreadcrumbItem,
  NDescriptions,
  NDescriptionsItem,
  NPopover,
  NIcon,
  NA,
  NForm,
  NFormItemGi,
  NInput,
  NDatePicker,
  NSwitch,
  NButton,
  NGrid,
  NSpace,
  NGridItem,
  NTimeline,
  NTimelineItem,
  NFormItem,
} from "naive-ui";
import { CreateOutline, ArrowForward } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default {
  setup() {
    const route = useRoute();
    const { missionId } = route.params;
    const missionData = ref({});
    const editEnabled = ref(false);
    const formRef = ref(null);
    const entryRef = ref(null);
    const loadingEdit = ref(false);
    const loadingDelete = ref(false);
    const loadingEntry = ref(false);
    const formValue = ref({});
    const entryValue = ref({});

    const entries = ref([]);
    const finalText = computed(
      () => entries.value && entries.value.map((entry) => entry.entry).join(" ")
    );

    onMounted(() => {
      axios
        .get(`${process.env.VUE_APP_API}/getLeg`, {
          params: {
            id: missionId,
          },
        })
        .then((data) => {
          missionData.value = data.data[0];
          formValue.value = {
            ...data.data[0],
            dd_zulu: dayjs.utc(data.data[0].dd_zulu).valueOf(),
            arrival_date: dayjs.utc(data.data[0].arrival_date).valueOf(),
          };
        })
        .catch((error) => {
          console.log(error);
        });

      axios
        .get(`${process.env.VUE_APP_API}/getEntriesForLeg`, {
          params: {
            leg_id: missionId,
          },
        })
        .then((data) => {
          entries.value = data.data;
        })
        .catch((error) => console.log(error));
    });

    return {
      missionData,
      dayjs,
      editEnabled,
      formRef,
      formValue,
      entryRef,
      entryValue,
      loadingEdit,
      loadingDelete,
      loadingEntry,
      entries,
      finalText,
      entryRules: {
        entry: [
          {
            required: true,
            message: "Please input your entry",
          },
        ],
      },
      rules: {
        dd_zulu: [
          {
            required: true,
            message: "Please select a date",
            validator: (rule, value) => {
              if (value) {
                const date = dayjs(value);
                if (date.isValid()) return true;
              }
              return new Error("Please select a valid date.");
            },
          },
        ],
        arrival_date: [
          {
            required: true,
            message: "Please select a time",
            validator: (rule, value) => {
              if (value) {
                const time = dayjs(value, "HH:mm");

                if (time.isValid()) return true;
              }
              return new Error("Please select a valid time.");
            },
          },
        ],
      },
    };
  },
  methods: {
    toggleEdit() {
      this.editEnabled = !this.editEnabled;
    },
    updateMission() {
      this.loadingEdit = true;
      axios
        .post(`${process.env.VUE_APP_API}/updateMission`, {
          ...this.formValue,
          dd_zulu: dayjs.utc(this.formValue.dd_zulu).toISOString(),
          arrival_date: dayjs.utc(this.formValue.arrival_date).toISOString(),
        })
        .then(() => {
          this.missionData = this.formValue;
          this.loadingEdit = false;
          this.editEnabled = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    deleteMission() {
      this.loadingDelete = true;
      axios
        .post(`${process.env.VUE_APP_API}/deleteMission`, {
          id: this.missionData.id,
        })
        .then(() => {
          this.$router.push("/missions");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    addEntry() {
      this.loadingEntry = true;
      axios
        .post(`${process.env.VUE_APP_API}/addEntryForLeg`, {
          leg_id: this.missionData.id,
          entry: this.entryValue.entry,
          date: dayjs.utc(this.entryValue.time).toISOString(),
        })
        .then((data) => {
          this.loadingEntry = false;
          this.entries.push({
            id: data.data.id,
            entry: this.entryValue.entry.replace("\n", ""),
            date: dayjs.utc(this.entryValue.time).toISOString(),
          });
          this.entryValue.entry = "";
          const container = this.$el.querySelector("#timeline");
          container.scrollTop = container.scrollHeight;
        })
        .catch((error) => {
          this.loadingEntry = false;
          console.log(error);
        });
    },
  },
  components: {
    NH1,
    NH2,
    NCard,
    NBreadcrumb,
    NBreadcrumbItem,
    NDescriptions,
    NDescriptionsItem,
    NPopover,
    NIcon,
    CreateOutline,
    NA,
    NForm,
    NFormItemGi,
    NGrid,
    NInput,
    NDatePicker,
    NSwitch,
    NButton,
    ArrowForward,
    NSpace,
    NGridItem,
    NTimeline,
    NTimelineItem,
    NFormItem,
  },
};
</script>
