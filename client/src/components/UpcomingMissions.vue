<template>
  <n-card title="Upcoming Missions (7 Days)">
    <n-data-table
      :loading="loading"
      :columns="columns"
      :data="missions"
      :pagination="pagination"
    />
    <template #action>
      View All
      <div style="float: right">
        <n-icon size="20">
          <open-outline />
        </n-icon>
      </div>
    </template>
  </n-card>
</template>

<script>
import { ref, onMounted } from "vue";
import { NCard, NDataTable, NIcon, useNotification } from "naive-ui";
import { OpenOutline } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const createColumns = () => [
  {
    title: "ETD (Z)",
    key: "dd_zulu",
  },
  {
    title: "ETA (Z)",
    key: "arrival_date",
  },
  {
    title: "From",
    key: "from",
  },
  {
    title: "To",
    key: "to",
  },
];

export default {
  setup() {
    const loading = ref(false);
    const missions = ref([]);
    const notification = useNotification();

    onMounted(() => {
      loading.value = true;
      axios
        .get(`${process.env.VUE_APP_API}/getMissionsUpcoming`, {
          params: {
            date: dayjs().format("MM/DD/YYYY"),
            type: "home",
          },
        })
        .then((data) => {
          missions.value = data.data.map((legs) => ({
            ...legs,
            dd_zulu: dayjs.utc(legs.dd_zulu).format("MM/DD/YYYY HH:mm"),
            arrival_date: dayjs
              .utc(legs.arrival_date)
              .format("MM/DD/YYYY HH:mm"),
          }));
          loading.value = false;
        })
        .catch((error) => {
          notification.error({
            content: "An error occured recieving upcoming missions (7 days)!",
            meta: error.response.data.message,
            duration: 5000,
          });
          loading.value = false;
        });
    });

    return {
      columns: createColumns(),
      missions,
      loading,
      pagination: {
        pageSize: 5,
      },
    };
  },
  components: {
    NCard,
    NDataTable,
    NIcon,
    OpenOutline,
  },
};
</script>
