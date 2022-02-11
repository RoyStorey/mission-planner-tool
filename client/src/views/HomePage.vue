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
        <upcoming-missions-stat />
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
        <upcoming-missions />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script>
import { onMounted } from "vue";
import {
  NH1,
  NIcon,
  NGrid,
  NGridItem,
  NCard,
  NStatistic,
  NCalendar,
  useLoadingBar,
} from "naive-ui";
import { Cube, TimeSharp } from "@vicons/ionicons5";
import {
  CalendarBadge,
  UpcomingMissions,
  UpcomingMissionsStat,
} from "../components";

export default {
  setup() {
    const loadingBar = useLoadingBar();
    loadingBar.start();

    onMounted(() => {
      setTimeout(() => {
        loadingBar.finish();
      }, 1000);
    });
  },
  components: {
    NH1,
    NIcon,
    Cube,
    NGrid,
    NGridItem,
    NCard,
    NStatistic,
    TimeSharp,
    NCalendar,
    CalendarBadge,
    UpcomingMissions,
    UpcomingMissionsStat,
  },
};
</script>
