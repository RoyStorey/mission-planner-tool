<template>
  <div class="content" style="width: 50%; margin: 0 auto">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <airplane />
      </n-icon>
      Export Legs
    </n-h1>
    <n-card title="Date Range">
      <n-date-picker
        :update-value-on-close="updateValueOnClose"
        v-model:value="range"
        type="daterange"
      />
      <n-button
        @click="exportMissions"
        :loading="loading"
        style="margin-top: 8px"
        type="primary"
      >
        Export
      </n-button>
      <n-alert
        v-if="noResults"
        title="No Results"
        style="margin-top: 8px"
        type="info"
        closable
      >
        No results were found!
      </n-alert>
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
  NDatePicker,
  NButton,
  NAlert,
} from "naive-ui";
import { Airplane } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";
import exportFromJSON from "export-from-json";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default {
  setup() {
    const loadingBar = useLoadingBar();
    const loading = ref(false);
    const range = ref([Date.now(), Date.now()]);
    const noResults = ref(false);

    loadingBar.start();

    onMounted(() => {
      setTimeout(() => {
        loadingBar.finish();
      }, 1000);
    });

    return {
      noResults,
      range,
      loading,
      updateValueOnClose: ref(true),
    };
  },
  methods: {
    exportMissions() {
      this.noResults = false;
      this.loading = true;
      const startDate = dayjs.utc(this.range[0]).startOf("day").toISOString();
      const endDate = dayjs.utc(this.range[1]).endOf("day").toISOString();

      axios
        .get(`${process.env.VUE_APP_API}/getMissionsFromDate`, {
          params: {
            startDate,
            endDate,
          },
        })
        .then((data) => {
          this.loading = false;
          if (data.data.length === 0) return (this.noResults = true);

          const { data: missionData } = data;
          const fileName = `MDT-LEGS-${startDate}-${endDate}.json`;
          const exportType = exportFromJSON.types.xls;

          exportFromJSON({ data: missionData, fileName, exportType });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  components: {
    NAlert,
    NH1,
    NIcon,
    Airplane,
    NCard,
    NDatePicker,
    NButton,
  },
};
</script>
