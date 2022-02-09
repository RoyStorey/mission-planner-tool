<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-notification-provider :max="3">
        <n-layout position="absolute">
          <n-layout-header class="nav" bordered>
            <navigation />
          </n-layout-header>
          <n-grid class="content" :cols="12" item-responsive>
            <n-grid-item offset="0 800:2" span="12 800:8">
              <router-view />
            </n-grid-item>
          </n-grid>
        </n-layout>
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script>
import { RouterView } from "vue-router";
import {
  NConfigProvider,
  darkTheme,
  NLayout,
  NLayoutHeader,
  NLoadingBarProvider,
  NNotificationProvider,
  NGrid,
  NGridItem,
} from "naive-ui";
import { Navigation } from "./components";

export default {
  name: "App",
  setup() {
    return {
      darkTheme,
    };
  },
  components: {
    NConfigProvider,
    NLayout,
    NLayoutHeader,
    NLoadingBarProvider,
    NNotificationProvider,
    RouterView,
    Navigation,
    NGrid,
    NGridItem,
  },
};
</script>

<style scoped>
.nav {
  display: grid;
  height: 4em;
  grid-template-rows: calc(4em - 1px);
  grid-template-columns: 1fr;
  padding: 0 1em;
  align-items: center;
}

.content {
  padding-top: 2em;
}
</style>
