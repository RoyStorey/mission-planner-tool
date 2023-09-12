<template>
  <n-card>
    <n-statistic label="Days Since Last Mission" :value="daysSinceMission">
      <template #prefix>
        <n-icon>
          <time-sharp />
        </n-icon>
      </template>
    </n-statistic>
  </n-card>
</template>

<script>
import { ref, onMounted } from "vue";
import { NCard, NStatistic, NIcon, useNotification } from "naive-ui";
import { TimeSharp } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default {
  setup() {
    const daysSinceMission = ref(0);
    const notification = useNotification();

    onMounted(() => {
      axios
        .get(`${process.env.MPT_API}/getMostRecentMission`, {
          params: {
            date: dayjs.utc().toISOString(),
          },
        })
        .then((data) => {
          const lastMissionDate =
            dayjs.utc(data.data[0].dd_zulu) || dayjs.utc();
          const difference = dayjs.utc().diff(lastMissionDate, "day");
          daysSinceMission.value = difference;
        })
        .catch((error) => {
          notification.error({
            content: "An error occured recieving days since last mission!",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    });

    return {
      daysSinceMission,
    };
  },
  components: {
    NCard,
    NStatistic,
    NIcon,
    TimeSharp,
  },
};
</script>
