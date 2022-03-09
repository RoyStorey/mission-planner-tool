<template>
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
          <n-form-item label="Time" path="time">
            <n-time-picker
              type="textarea"
              v-model:formatted-value="entryValue.time"
              format="HH:mm"
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
      <n-scrollbar ref="scroll" style="height: 275px">
        <n-timeline>
          <n-timeline-item type="success" content="Mission start." />
          <n-timeline-item
            v-bind:key="entry.id"
            v-for="entry in entries"
            :title="entry.entry"
            :time="dayjs.utc(entry.date).format('MM/DD/YYYY HH:mm')"
          >
            <n-popconfirm @positive-click="deleteEntry(entry)">
              <template #trigger>
                <n-a style="float: right; padding-right: 1em">
                  <n-icon><trash /></n-icon>
                </n-a>
              </template>
              Are you sure you want to delete this entry?
            </n-popconfirm>
          </n-timeline-item>
        </n-timeline>
      </n-scrollbar>
    </n-grid-item>
  </n-grid>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import {
  NH2,
  NCard,
  NPopconfirm,
  NForm,
  NInput,
  NButton,
  NGrid,
  NGridItem,
  NTimeline,
  NTimelineItem,
  NFormItem,
  NTimePicker,
  NScrollbar,
  NA,
  NIcon,
  useNotification,
} from "naive-ui";
import { Trash } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(utc);
dayjs.extend(customParseFormat);

export default {
  emits: ["updateExportText"],
  props: ["missionData"],
  setup(props) {
    const notification = useNotification();
    const entryRef = ref(null);
    const entryValue = ref({
      entry: "",
      time: dayjs.utc().format("HH:mm"),
    });
    const entries = ref([]);
    const loadingEntry = ref(false);
    const scroll = ref(null);

    watch(
      () => props.missionData,
      (data) => {
        axios
          .get(`${process.env.VUE_APP_API}/getEntriesForLeg`, {
            params: {
              leg_id: data.id,
            },
          })
          .then((data) => {
            entries.value = data.data;
          })
          .catch((error) =>
            notification.error({
              content: "An error occured",
              meta: error.response.data.message,
              duration: 5000,
            })
          );
      }
    );

    onMounted(() => {});

    return {
      dayjs,
      scroll,
      entryRef,
      entryValue,
      loadingEntry,
      entries,
      entryRules: {
        entry: [
          {
            required: true,
            validator(rule, value) {
              if (value.trim() === "") {
                return Promise.reject("Please enter an entry.");
              }
              return Promise.resolve();
            },
          },
        ],
        time: [
          {
            required: true,
            message: "Please input a time",
          },
        ],
      },
    };
  },
  watch: {
    entries(entries) {
      this.$nextTick(() => {
        this.$emit(
          "updateExportText",
          entries.map((entry) => entry.entry.replace("\n", "")).join(" ")
        );
        this.scroll.scrollTo({
          top: document.querySelector(".n-scrollbar-content").scrollHeight,
          behavior: "smooth",
        });
      });
    },
  },
  methods: {
    addEntry() {
      this.entryRef.validate((errors) => {
        if (!errors) {
          this.loadingEntry = true;
          axios
            .post(`${process.env.VUE_APP_API}/addEntryForLeg`, {
              leg_id: this.missionData.id,
              entry: this.entryValue.entry,
              date: dayjs
                .utc(
                  `${dayjs
                    .utc(this.missionData.dd_zulu)
                    .format("MM/DD/YYYY")} ${this.entryValue.time}`,
                  "MM/DD/YYYY HH:mm"
                )
                .toISOString(),
            })
            .then((data) => {
              this.loadingEntry = false;
              this.entries = [
                ...this.entries,
                {
                  id: data.data.id,
                  entry: this.entryValue.entry.replace("\n", ""),
                  date: dayjs
                    .utc(
                      `${dayjs
                        .utc(this.missionData.dd_zulu)
                        .format("MM/DD/YYYY")} ${this.entryValue.time}`,
                      "MM/DD/YYYY HH:mm"
                    )
                    .toISOString(),
                },
              ];
              this.entryValue.entry = "";
              this.entryValue.time = dayjs.utc().format("HH:mm");
            })
            .catch((error) => {
              console.log(error);
              this.loadingEntry = false;
              this.notification.error({
                content: "An error occured",
                meta: error.response.data.message,
                duration: 5000,
              });
            });
        }
      });
    },
    deleteEntry(entry) {
      const { id } = entry;
      axios
        .post(`${process.env.VUE_APP_API}/deleteEntry`, { id })
        .then(() => {
          this.entries = this.entries.filter((e) => e.id !== id);
        })
        .catch((error) => {
          this.notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    },
  },
  components: {
    NGrid,
    NGridItem,
    NCard,
    NForm,
    NFormItem,
    NInput,
    NTimePicker,
    NButton,
    NH2,
    NScrollbar,
    NTimeline,
    NTimelineItem,
    NPopconfirm,
    NIcon,
    NA,
    Trash,
  },
};
</script>
