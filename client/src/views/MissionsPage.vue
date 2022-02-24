<template>
  <div class="content">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <airplane />
      </n-icon>
      Missions
    </n-h1>
    <n-card title="Mission List">
      <n-data-table
        remote
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        :data="data"
        :rowProps="rowProps"
      />
    </n-card>
  </div>
</template>

<script>
import { onMounted, ref, reactive } from "vue";
import router from "../router";
import { NH1, NIcon, NCard, NDataTable } from "naive-ui";
import { Airplane } from "@vicons/ionicons5";
import { useRoute } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const createColumns = () => {
  return [
    {
      title: "Mission #",
      key: "mission_number",
    },
    {
      title: "Airport",
      key: "airport",
    },
    {
      title: "Dep. Date",
      key: "dd_zulu",
    },
    {
      title: "ETD (Z)",
      key: "etdz",
    },
    {
      title: "Arr. Date",
      key: "arrival_date",
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
      title: "GRND Time",
      key: "gnd_time",
    },
  ];
};

const query = (page, pageSize = 10, filter) => {
  return new Promise((resolve) => {
    axios
      .get(`${process.env.VUE_APP_API}/getMissions`, {
        params: {
          page,
          pageSize,
          filter,
        },
      })
      .then((data) => {
        resolve(data.data.rows[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

export default {
  setup() {
    const route = useRoute();
    const dataRef = ref([]);
    const loading = ref(false);
    const paginationReactive = reactive({
      page: 1,
      pageCount: 1,
      pageSize: 10,
      prefix({ itemCount }) {
        return `${itemCount} Mission${itemCount > 1 ? "s" : ""}`;
      },
    });

    onMounted(() => {
      loading.value = true;
      query(
        paginationReactive.page,
        paginationReactive.pageSize,
        route.query
      ).then((data) => {
        dataRef.value =
          data.rows?.map((leg) => ({
            ...leg,
            dd_zulu: dayjs.utc(leg.dd_zulu).format("MM/DD/YYYY"),
            etdz: dayjs.utc(leg.dd_zulu).format("HH:mm"),
            arrival_date: dayjs.utc(leg.arrival_date).format("MM/DD/YYYY"),
            etaz: dayjs.utc(leg.arrival_date).format("HH:mm"),
          })) || [];

        paginationReactive.pageCount = Math.ceil(
          data.count / paginationReactive.pageSize
        );
        paginationReactive.itemCount = Number(data.count);
        loading.value = false;
      });
    });

    return {
      data: dataRef,
      pagination: paginationReactive,
      loading,
      columns: createColumns(),
      rowProps: (row) => {
        return {
          style: "cursor: pointer;",
          onClick: () => {
            router.push(`/mission/${row.id}`);
          },
        };
      },
      handlePageChange(currentPage) {
        if (!loading.value) {
          loading.value = true;
          query(currentPage, paginationReactive.pageSize).then((data) => {
            paginationReactive.page = currentPage;
            dataRef.value = data.rows.map((leg) => ({
              ...leg,
              dd_zulu: dayjs.utc(leg.dd_zulu).format("MM/DD/YYYY"),
              etdz: dayjs.utc(leg.etdz).format("HH:mm"),
              arrival_date: dayjs.utc(leg.arrival_date).format("MM/DD/YYYY"),
              etaz: dayjs.utc(leg.etaz).format("HH:mm"),
            }));
            paginationReactive.pageCount = Math.ceil(
              data.count / paginationReactive.pageSize
            );
            paginationReactive.itemCount = data.count;
            loading.value = false;
          });
        }
      },
    };
  },
  components: {
    NH1,
    NIcon,
    NCard,
    NDataTable,
    Airplane,
  },
};
</script>
