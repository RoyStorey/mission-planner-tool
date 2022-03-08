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
    <operators-assigned :missionData="missionData" />
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
    <mission-timeline
      :missionData="missionData"
      @updateExportText="updateExportText"
    />
    <n-card title="Export Mission" style="margin-bottom: 1em">
      <n-grid :span="24" :x-gap="24">
        <n-form-item-gi :span="24" label="Mission Text">
          <n-input
            v-model:value="finalText"
            type="textarea"
            readonly
            style="width: 100%"
          />
        </n-form-item-gi>
      </n-grid>
      <n-button
        :loading="loadingMissionExport"
        style="float: right"
        type="primary"
        @click="exportMission"
      >
        Export
      </n-button>
    </n-card>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  NH1,
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
  useNotification,
} from "naive-ui";
import { CreateOutline, ArrowForward } from "@vicons/ionicons5";
import { OperatorsAssigned, MissionTimeline } from "../components";
import createReport from "docx-templates";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const saveDataToFile = (data, fileName, mimeType) => {
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName, mimeType);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

const downloadURL = (data, fileName) => {
  const a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = "display: none";
  a.click();
  a.remove();
};

export default {
  setup() {
    const route = useRoute();
    const notification = useNotification();
    const { missionId } = route.params;
    const missionData = ref({});
    const editEnabled = ref(false);
    const formRef = ref(null);
    const loadingEdit = ref(false);
    const loadingDelete = ref(false);
    const formValue = ref({});
    const finalText = ref(null);
    const loadingMissionExport = ref(false);

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
          notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    });

    return {
      missionData,
      dayjs,
      editEnabled,
      formRef,
      formValue,
      loadingEdit,
      loadingDelete,
      finalText,
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
        loadingMissionExport,
      },
    };
  },
  watch: {
    entries() {
      this.$nextTick(() =>
        this.scroll.scrollTo({
          top: document.querySelector(".n-scrollbar-content").scrollHeight,
          behavior: "smooth",
        })
      );
    },
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
          operators: null,
          dd_zulu: dayjs.utc(this.formValue.dd_zulu).toISOString(),
          arrival_date: dayjs.utc(this.formValue.arrival_date).toISOString(),
        })
        .then(() => {
          this.missionData = this.formValue;
          this.loadingEdit = false;
          this.editEnabled = false;
        })
        .catch((error) => {
          this.notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
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
          this.notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    },
    updateExportText(value) {
      this.finalText = value;
    },
    async exportMission() {
      this.loadingMissionExport = true;
      const template = await fetch(
        process.env.NODE_ENV === "development" ? "./" : "/mpt/" + "MISREP.docx"
      ).then((res) => res.arrayBuffer());
      const report = await createReport({
        template,
        data: {
          msnNumber: this.missionData.mission_number,
          date: `${dayjs(this.missionData.dd_zulu).format(
            "MMMM DD, YYYY"
          )} to ${dayjs(this.missionData.arrival_date).format(
            "MMMM DD, YYYY"
          )}`,
          finalText: this.finalText,
        },
      });

      saveDataToFile(
        report,
        "report.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      this.loadingMissionExport = false;
    },
  },
  components: {
    NH1,
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
    MissionTimeline,
    OperatorsAssigned,
  },
};
</script>
