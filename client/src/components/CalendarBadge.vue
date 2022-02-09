<template>
  <n-badge :value="missionsOnDate" />
</template>

<script>
import { NBadge } from "naive-ui";
export default {
  props: ["year", "month", "day"],
  setup(props) {
    const providedDate = `${props.year}-${props.month}-${props.day}`;
    const missionsOnDate = "1 Mission";

    return {
      providedDate,
      missionsOnDate,
    };
  },
  components: {
    NBadge,
  },
};
</script>
