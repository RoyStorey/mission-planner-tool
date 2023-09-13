<template>
  <div class="content">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <accessibility />
      </n-icon>
      Operator Stats
    </n-h1>
    <n-grid
      :cols="8"
      :y-gap="10"
      :x-gap="10"
      style="margin-bottom: 1em"
      item-responsive
    >
      <n-grid-item span="2">
        <n-card title="Select Date Range">
          <n-date-picker
            v-model:value="date"
            type="daterange"
            style="width: 100%"
            format="MM/dd/yyyy"
          />
        </n-card>
      </n-grid-item>
      <n-grid-item span="2">
        <n-card title="Select Operator">
          <n-select
            v-model:value="operator"
            :options="operatorOptions"
            filterable
            :loading="loadingOperators"
            placeholder="Select an operator"
            style="width: 100%"
          />
        </n-card>
      </n-grid-item>
      <n-grid-item span="2">
        <n-card style="height: 123.8px">
          <n-statistic label="Total Missions" :value="totalMissions">
            <template #prefix>
              <n-icon>
                <airplane />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item span="2">
        <n-card style="height: 123.8px">
          <n-statistic label="Total Hours Escorted" :value="totalHours">
            <template #prefix>
              <n-icon>
                <stopwatch />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item span="8">
        <n-data-table
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :data="missions"
          :rowProps="rowProps"
        />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import {
  NH1,
  NIcon,
  NGrid,
  NGridItem,
  useLoadingBar,
  NCard,
  NDatePicker,
  NStatistic,
  NDataTable,
  useNotification,
  NSelect,
} from "naive-ui";
import { Airplane, Stopwatch, Accessibility } from "@vicons/ionicons5";
import router from "../router";
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

export default {
  setup() {
    const date = ref([
      dayjs.utc().subtract(7, "day").valueOf(),
      dayjs.utc().endOf("day").valueOf(),
    ]);
    const missions = ref([]);
    const totalMissions = ref(0);
    const totalHours = ref(0);
    const loading = ref(false);
    const notification = useNotification();
    const loadingOperators = ref(false);
    const operatorOptions = ref([]);
    const operator = ref(null);

    const loadingBar = useLoadingBar();
    loadingBar.start();

    onMounted(() => {
      setTimeout(() => {
        loadingBar.finish();
      }, 1000);

      loadingOperators.value = true;
      axios
        .get(`${process.env.VUE_APP_API}/getOperators`)
        .then((data) => {
          loadingOperators.value = false;
          operatorOptions.value = data.data.map((operator) => ({
            label: operator.name,
            value: operator.id,
          }));
        })
        .catch((error) => console.log(error));
    });

    const loadMissions = (startDate, endDate, operator) => {
      loading.value = true;
      axios
        .get(`${process.env.VUE_APP_API}/getMissionsFromDateForOperator`, {
          params: {
            startDate,
            endDate,
            operator,
          },
        })
        .then((data) => {
          missions.value = data.data.map((mission) => ({
            ...mission,
            dd_zulu: dayjs.utc(mission.dd_zulu).format("MM/DD/YYYY"),
            etdz: dayjs.utc(mission.dd_zulu).format("HH:mm"),
            arrival_date: dayjs.utc(mission.arrival_date).format("MM/DD/YYYY"),
            etaz: dayjs.utc(mission.arrival_date).format("HH:mm"),
          }));
          totalMissions.value = data.data.length;

          let totalHoursCounter = 0;
          data.data.forEach((mission) => {
            totalHoursCounter += dayjs
              .utc(mission.arrival_date)
              .diff(dayjs.utc(mission.dd_zulu), "hour");
          });

          totalHours.value = totalHoursCounter;
          loading.value = false;
        })
        .catch((error) => {
          console.log(error);
          notification.error({
            content: "An error occured recieving days since last mission!",
            meta: error.response.data.message,
            duration: 5000,
          });
          loading.value = false;
        });
    };

    return {
      operator,
      loadingOperators,
      operatorOptions,
      date,
      loadMissions,
      totalMissions,
      totalHours,
      columns: createColumns(),
      missions,
      loading,
      pagination: {
        pageSize: 10,
      },
      rowProps: (row) => {
        return {
          style: "cursor: pointer;",
          onClick: () => {
            router.push(`/mission/${row.id}`);
          },
        };
      },
    };
  },
  methods: {},
  watch: {
    date(newVal) {
      const [startDate, endDate] = newVal;
      if (this.operator)
        this.loadMissions(
          dayjs.utc(startDate).toISOString(),
          dayjs.utc(endDate).endOf("day").toISOString(),
          this.operator
        );
    },
    operator(newVal) {
      const [startDate, endDate] = this.date;
      if (newVal)
        this.loadMissions(
          dayjs.utc(startDate).toISOString(),
          dayjs.utc(endDate).endOf("day").toISOString(),
          newVal
        );
    },
  },
  components: {
    NH1,
    NIcon,
    NGrid,
    NGridItem,
    Accessibility,
    NCard,
    NDatePicker,
    NStatistic,
    Airplane,
    NDataTable,
    Stopwatch,
    NSelect,
  },
};
</script>
