<template>
  <div class="content" style="width: 50%; margin: 0 auto">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <document />
      </n-icon>
      Generate MISREP
    </n-h1>
    <n-card title="Select Mission">
      <n-space vertical size="large">
        <n-alert title="Important" type="info" closable>
          Do not select relevant findings unless the findings are
          <b>credible</b> cyber incidents discovered on mission. <br />
          Additionally, once the MISREP is generated it will have placeholders
          that will require you to fill in additional information as required.
        </n-alert>
        <n-space>
          <n-select
            v-model:value="selectedMission"
            filterable
            placeholder="Select a mission"
            :options="missions"
            :loading="loadingMissions"
          />
          <n-checkbox v-model:checked="relevantFindings">
            Relevant findings?
          </n-checkbox>
        </n-space>
        <n-button type="primary" :loading="loading" @click="exportMisrep">
          Export
        </n-button>
        <n-alert v-if="error" title="Error" type="error" closable>
          {{ error }}
        </n-alert>
      </n-space>
    </n-card>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import {
  NH1,
  NIcon,
  NCard,
  useLoadingBar,
  useNotification,
  NSelect,
  NCheckbox,
  NButton,
  NSpace,
  NAlert,
} from "naive-ui";
import { Document } from "@vicons/ionicons5";
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
    const notification = useNotification();
    const loadingBar = useLoadingBar();
    const missions = ref([]);
    const selectedMission = ref(null);
    const loadingMissions = ref(false);
    const relevantFindings = ref(false);
    const loading = ref(false);
    const error = ref(null);

    loadingBar.start();

    onMounted(() => {
      setTimeout(() => {
        loadingBar.finish();
      }, 1000);

      loadingMissions.value = true;

      axios
        .get(`/mpt-api/getActualMissions`)
        .then((data) => {
          loadingMissions.value = false;
          missions.value = data.data.map((mission) => ({
            label: mission.mission_number,
            value: mission.mission_number,
          }));
        })
        .catch((error) => {
          loadingMissions.value = false;
          notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    });

    return {
      error,
      notification,
      relevantFindings,
      loadingMissions,
      missions,
      selectedMission,
      loading,
    };
  },
  methods: {
    async exportMisrep() {
      this.loading = true;
      this.error = null;
      try {
        const { data: legs } = await axios.get(`/mpt-api/getLegsByMission`, {
          params: {
            mission: this.selectedMission,
          },
        });

        if (!legs.length)
          return (this.error = "No legs found for this mission");

        const startDate = dayjs(legs[0].dd_zulu).format("MMMM DD, YYYY");
        const endDate = dayjs(legs[legs.length - 1].arrival_date).format(
          "MMMM DD, YYYY"
        );

        const legIds = legs.map((leg) => leg.id);

        const docxLegInfo = Promise.all(
          legIds.map(async (legId, i) => {
            const { data: entries } = await axios.get(
              `/mpt-api/getEntriesForLeg`,
              {
                params: {
                  leg_id: legId,
                },
              }
            );

            const { data: leg } = await axios.get(`/mpt-api/getLeg`, {
              params: {
                id: legId,
              },
            });

            const finalText = entries.length
              ? entries.map((entry) => entry.entry).join(" ")
              : "No Data";
            return {
              from: leg.from,
              to: leg.to,
              date: dayjs.utc(leg.dd_zulu).format("MM/DD/YYYY"),
              number: i + 1,
              finalText,
            };
          })
        );

        const template = await fetch(
          process.env.NODE_ENV === "development"
            ? "./MISREP.docx"
            : "/mpt/" + "MISREP.docx"
        ).then((res) => res.arrayBuffer());

        const report = await createReport({
          template,
          data: {
            msnNumber: this.selectedMission,
            date: `${startDate} to ${endDate}`,
            legs: docxLegInfo,
            relevantFindings: this.relevantFindings,
          },
        });

        saveDataToFile(
          report,
          "MISREP.docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
        this.notification.error({
          content: "An error occured",
          meta: error.response.data.message,
          duration: 5000,
        });
      }
    },
  },
  components: {
    NH1,
    NIcon,
    Document,
    NCard,
    NSelect,
    NButton,
    NCheckbox,
    NSpace,
    NAlert,
  },
};
</script>
