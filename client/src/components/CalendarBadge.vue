<template>
  <n-badge v-if="missionsOnDate?.value" :value="missionsOnDate?.value" />
</template>

<script>
import { onMounted, watch, ref } from "vue";
import { NBadge } from "naive-ui";
import axios from "axios";
import dayjs from "dayjs";

export default {
  props: ["year", "month", "date"],
  setup(props) {
    const missionsOnDate = ref(null);

    onMounted(() => {
      const providedDate = dayjs(`${props.year}-${props.month}-${props.date}`);
      axios
        .get(`/mpt-api/getMissionsOnDate`, {
          params: {
            date: providedDate.format("MM/DD/YYYY"),
          },
        })
        .then((data) => {
          if (data.data.length !== 0)
            missionsOnDate.value = ref(
              `${data.data.length}` +
                `${data.data.length > 1 ? " Legs" : " Leg"}`
            );
        })
        .catch((error) => {
          console.log(error);
        });
    });

    watch(
      () => [props.year, props.month, props.date],
      (newValue) => {
        const providedDate = dayjs(
          `${newValue[0]}-${newValue[1]}-${newValue[2]}`
        );
        axios
          .get(`/mpt-api/getMissionsOnDate`, {
            params: {
              date: providedDate.format("MM/DD/YYYY"),
            },
          })
          .then((data) => {
            if (data.data.length !== 0)
              missionsOnDate.value = ref(
                `${data.data.length}` +
                  `${data.data.length > 1 ? " Legs" : " Leg"}`
              );
            else missionsOnDate.value = null;
          })
          .catch((error) => {
            console.log(error);
          });
      }
    );

    return {
      missionsOnDate,
    };
  },
  components: {
    NBadge,
  },
};
</script>
