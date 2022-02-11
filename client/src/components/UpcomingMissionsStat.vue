<template>
  <n-card>
    <n-statistic label="Upcoming Missions" :value="total">
      <template #prefix>
        <n-icon>
          <airplane />
        </n-icon>
        <div style="float: right">
          <router-link :to="{ path: '/missions' }">
            <n-popover :show-arrow="false" trigger="hover">
              <template #trigger>
                <n-a>
                  <n-icon size="20">
                    <open-outline />
                  </n-icon>
                </n-a>
              </template>
              <span>View all missions</span>
            </n-popover>
          </router-link>
        </div>
      </template>
    </n-statistic>
  </n-card>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  NCard,
  NStatistic,
  NIcon,
  NPopover,
  NA,
  useNotification,
} from "naive-ui";
import { Airplane, OpenOutline } from "@vicons/ionicons5";
import axios from "axios";
import dayjs from "dayjs";

export default {
  setup() {
    const loading = ref(false);
    const total = ref(0);
    const notification = useNotification();

    onMounted(() => {
      loading.value = true;
      axios
        .get(`${process.env.VUE_APP_API}/getMissionsUpcoming`, {
          params: {
            date: dayjs().format("MM/DD/YYYY"),
            type: "stat",
          },
        })
        .then((data) => {
          loading.value = false;
          total.value = data.data.length;
        })
        .catch((error) => {
          loading.value = false;
          notification.error({
            content: "An error occured recieving upcoming mission stats!",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    });

    return {
      loading,
      total,
    };
  },
  components: {
    NCard,
    NStatistic,
    NIcon,
    NPopover,
    NA,
    Airplane,
    OpenOutline,
  },
};
</script>
