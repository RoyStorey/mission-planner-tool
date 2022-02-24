<template>
  <div class="content" style="width: 50%; margin: 0 auto">
    <n-h1 prefix="bar" style="display: flex; align-items: center">
      <n-icon style="margin-right: 8px">
        <cog />
      </n-icon>
      Settings
    </n-h1>
    <n-card>
      <n-collapse>
        <operator-settings />
        <mission-indicator-settings />
      </n-collapse>
    </n-card>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { NH1, NIcon, NCollapse, NCard, useLoadingBar } from "naive-ui";
import { Cog } from "@vicons/ionicons5";
import { OperatorSettings, MissionIndicatorSettings } from "../components";

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
    Cog,
    NCard,
    NCollapse,
    OperatorSettings,
    MissionIndicatorSettings,
  },
};
</script>
