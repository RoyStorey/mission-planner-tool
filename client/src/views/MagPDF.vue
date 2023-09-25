<template>
  <div class="content">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <cloud-upload />
      </n-icon>
      Import MAG PDF
    </n-h1>
    <n-alert
      v-if="!missions.value?.length"
      title="Important!"
      type="info"
      closable
      style="margin-bottom: 1em"
    >
      In order to import the MAG PDF, you must follow these steps:
      <ol>
        <li>On Desktop Anywhere, open the PDF in Adobe Acrobat Reader.</li>
        <li>Export the PDF as an Excel file.</li>
        <li>Open the Excel file in Excel.</li>
        <li>Export the file as a tab-delimited text file.</li>
      </ol>
    </n-alert>
    <n-alert
      v-if="missions.value?.length"
      type="warning"
      title="Important!"
      closable
      style="margin-bottom: 1em"
    >
      Please verify that the entries you keep are correct. If they are not, you
      will be able to edit them after they are saved into the database.
    </n-alert>
    <n-card v-if="!missions.value?.length" title="Upload File">
      <n-upload
        :max="1"
        :action="url"
        :customRequest="handleUpload"
        accept=".pdf"
        :on-change="handleAddFile"
        :file-list="fileList"
        :on-update:file-list="handleFileListUpdate"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <archive />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            Click or drag a file to this area to upload
          </n-text>
        </n-upload-dragger>
      </n-upload>
    </n-card>
    <n-card
      v-if="missions.value?.length"
      title="Process Missions"
      style="margin-bottom: 1em"
    >
      <template #header-extra>
        <n-space>
          <n-button
            :loading="loadingSaved"
            @click="saveMissions"
            type="primary"
          >
            <n-icon>
              <save />
            </n-icon>
            Save
          </n-button>
          <n-button @click="clearMissions" type="error">
            <n-icon>
              <trash-bin />
            </n-icon>
            Cancel
          </n-button>
        </n-space>
      </template>
      <div v-for="(mission, index) in missions.value" :key="index">
        <n-h2>
          <n-text type="primary"> Mission #{{ mission.missionNumber }} </n-text>
        </n-h2>
        <n-data-table
          :columns="columns"
          :data="mission.legs"
          :pagination="true"
        />
        <n-divider />
      </div>
    </n-card>
  </div>
</template>

<script>
import { onMounted, ref, h } from "vue";
import {
  useLoadingBar,
  NH1,
  NIcon,
  NAlert,
  NCard,
  NUpload,
  NUploadDragger,
  NText,
  useNotification,
  NDataTable,
  NDivider,
  NH2,
  NSpace,
  NButton,
} from "naive-ui";
import { CloudUpload, Archive, Trash, Save, TrashBin } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

const renderIcon = (icon) => {
  return () => h(NIcon, { size: "20" }, { default: () => h(icon) });
};

const createColumns = ({ removeLeg }) => [
  {
    title: "Del",
    key: "edit",
    render(row) {
      return h(renderIcon(Trash), {
        onClick: () => removeLeg(row),
        style: "cursor:pointer",
      });
    },
  },
  {
    title: "Dep. Airport",
    key: "airport",
  },
  {
    title: "DV Code",
    key: "dvcode",
  },
  {
    title: "Dep. Date",
    key: "ddzulu",
  },
  {
    title: "ETD (Z)",
    key: "etdz",
  },
  {
    title: "Arr. Date",
    key: "arrDate",
  },
  {
    title: "ETA (Z)",
    key: "etaz",
  },
  {
    title: "From",
    key: "from",
  },
  {
    title: "To",
    key: "to",
  },
  {
    title: "Dep. GRND Time",
    key: "groundTime",
  },
];

export default {
  setup() {
    const missions = ref([]);
    const loadingBar = useLoadingBar();
    const notification = useNotification();
    const removeRow = ref(null);
    const fileList = ref([]);
    const loadingSaved = ref(false);
    loadingBar.start();

    onMounted(() => {
      setTimeout(() => {
        loadingBar.finish();
      }, 1000);
    });

    const handleAddFile = ({ file }) => {
      fileList.value = [file];
    };

    const handleFileListUpdate = ({ fileList: files }) =>
      (fileList.value = files);

    const formatData = (data) => data;

    const removeLeg = (row) => {
      console.log(row);
      removeRow.value = row;
    };

    return {
      handleAddFile,
      handleFileListUpdate,
      fileList,
      missions,
      notification,
      columns: createColumns({ removeLeg }),
      formatData,
      removeRow,
      loadingSaved,
      url: `/mpt-api/processPDF`,
    };
  },
  methods: {
    handleUpload({ action, file, onFinish, onError, onProgress }) {
      const formData = new FormData();
      formData.append("file", file.file);

      axios
        .post(action, formData, {
          onUploadProgress: ({ loaded, total }) => {
            onProgress({ percent: Math.ceil((loaded / total) * 100) });
          },
        })
        .then((data) => {
          this.missions.value = data.data.map((mission) => {
            mission.legs = mission.legs.map((leg) => {
              const departureDate = dayjs
                .utc(`${leg.ddzulu} ${leg.etdz}`, "DD-MM-YY HH:mm")
                .isValid()
                ? dayjs.utc(`${leg.ddzulu} ${leg.etdz}`, "DD-MM-YY HH:mm")
                : dayjs.utc(`${leg.ddzulu} ${leg.etdz}`, "DD-MMM-YY HH:mm");
              const unformattedArrivalDate = dayjs.utc(leg.arrDate, "DD-MMM");
              const arrivalMonth = unformattedArrivalDate.month();
              const arrivalYear =
                arrivalMonth < departureDate.month()
                  ? departureDate.year() + 1
                  : departureDate.year();
              const arrivalDate = dayjs.utc(
                `${leg.arrDate}-${arrivalYear} ${leg.etaz}`,
                "DD-MMM-YYYY HH:mm"
              );

              return {
                ...leg,
                ddzulu: departureDate.format("MM/DD/YYYY"),
                etdz: departureDate.format("HH:mm"),
                arrDate: arrivalDate.format("MM/DD/YYYY"),
                etaz: arrivalDate.format("HH:mm"),
              };
            });
            return mission;
          });
          onFinish(true);
        })
        .catch((error) => {
          this.notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
          onError(error);
        });
    },
    clearMissions() {
      this.missions.value = [];
    },
    saveMissions() {
      const data = this.missions.value;
      this.loadingSaved = true;
      axios
        .post(process.env.VUE_APP_API + "/confirmMissions", data)
        .then(() => {
          this.loadingSaved = false;
          this.missions.value = [];
          this.notification.success({
            content: "Missions saved",
            duration: 5000,
          });
        })
        .catch((error) => {
          this.loadingSaved = false;
          this.notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    },
  },
  watch: {
    removeRow(newValue) {
      this.missions.value = this.missions.value.map((mission) => {
        mission.legs = mission.legs.filter((leg) => {
          return leg?.key !== newValue?.key;
        });
        return mission;
      });

      this.missions.value = this.missions.value.filter(
        (mission) => mission.legs.length
      );

      this.removeRow = null;
    },
  },
  components: {
    NH1,
    NIcon,
    CloudUpload,
    NAlert,
    NCard,
    NUpload,
    NUploadDragger,
    NText,
    Archive,
    NDataTable,
    NDivider,
    NH2,
    NSpace,
    NButton,
    Save,
    TrashBin,
  },
};
</script>

<style>
.n-upload-trigger {
  width: 100%;
}
</style>
