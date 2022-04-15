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
        <days-since-last-mission />
      </n-grid-item>
      <n-grid-item span="2">
        <message-of-the-day />
      </n-grid-item>
    </n-grid>
    <n-grid :cols="2" :x-gap="10" :y-gap="10" item-responsive>
      <n-grid-item span="2 600:1">
        <n-card title="Calendar View">
          <n-calendar
            style="max-height: 500px"
            #="{ year, month, date }"
            :on-update:value="selectDate"
          >
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
  NCalendar,
  useLoadingBar,
} from "naive-ui";
import { Cube } from "@vicons/ionicons5";
import {
  CalendarBadge,
  UpcomingMissions,
  UpcomingMissionsStat,
  DaysSinceLastMission,
  MessageOfTheDay,
} from "../components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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
  methods: {
    selectDate(timestamp) {
      const selectedDay = dayjs.utc(timestamp).format("MM/DD/YYYY");
      this.$router.push(`/missions?date=${selectedDay}`);
    },
  },
  components: {
    NH1,
    NIcon,
    Cube,
    NGrid,
    NGridItem,
    NCard,
    NCalendar,
    CalendarBadge,
    UpcomingMissions,
    UpcomingMissionsStat,
    DaysSinceLastMission,
    MessageOfTheDay,
  },
};
</script>
