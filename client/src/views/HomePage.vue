<template>
  <div class="content">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <cube />
      </n-icon>
      Dashboard
    </n-h1>
    <n-grid :cols="4" :x-gap="10" style="margin-bottom: 1em" item-responsive>
      <n-grid-item span="2 600:1">
        <n-card>
          <n-statistic label="Upcoming Missions" :value="2">
            <template #prefix>
              <n-icon>
                <airplane />
              </n-icon>
              <div style="float: right">
                <n-icon size="20">
                  <open-outline />
                </n-icon>
              </div>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item span="2 600:1">
        <n-card>
          <n-statistic label="Days Since Last Mission" :value="108">
            <template #prefix>
              <n-icon>
                <time-sharp />
              </n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>
    <n-grid :cols="2" :x-gap="10" :y-gap="10" item-responsive>
      <n-grid-item span="2 600:1">
        <n-card title="Calendar View">
          <n-calendar style="max-height: 500px" #="{ year, month, date }">
            <calendar-badge :year="year" :month="month" :date="date" />
          </n-calendar>
        </n-card>
      </n-grid-item>
      <n-grid-item span="2 600:1">
        <n-card title="Upcoming Missions (7 Days)">
          <n-data-table :columns="columns" :data="data" :pagination="true" />
          <template #action>
            View All
            <div style="float: right">
              <n-icon size="20">
                <open-outline />
              </n-icon>
            </div>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script>
import {
  NH1,
  NIcon,
  NGrid,
  NGridItem,
  NCard,
  NStatistic,
  NDataTable,
  NCalendar,
} from "naive-ui";
import { Cube, Airplane, TimeSharp, OpenOutline } from "@vicons/ionicons5";
import { CalendarBadge } from "../components";

const createColumns = () => [
  {
    title: "#",
    key: "number",
  },
  {
    title: "Date",
    key: "date",
  },
  {
    title: "Time",
    key: "time",
  },
];

const data = [
  {
    number: "455455",
    date: "lajdsflkasjdf",
    time: "1550Z - 1650Z",
  },
  {
    number: "455455",
    date: "lajdsflkasjdf",
    time: "1550Z - 1650Z",
  },
];

export default {
  setup() {
    return {
      data,
      columns: createColumns(),
    };
  },
  components: {
    NH1,
    NIcon,
    Cube,
    NGrid,
    NGridItem,
    NCard,
    NStatistic,
    Airplane,
    TimeSharp,
    NDataTable,
    NCalendar,
    CalendarBadge,
    OpenOutline,
  },
};
</script>
