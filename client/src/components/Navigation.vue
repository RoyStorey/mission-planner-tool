<template>
  <n-grid :cols="12" style="height: 100%" item-responsive>
    <n-grid-item class="align-center" span="4">
      <n-icon size="28">
        <globe-outline />
      </n-icon>
      <n-text class="logo"> 89th CS MPT </n-text>
      <n-divider style="height: 2.5em" vertical />
    </n-grid-item>
    <n-grid-item class="align-center justify-center" span="0 800:4">
      <n-input-group>
        <n-input placeholder="mission number, airport, operator assigned..." />
        <n-button type="primary">
          <n-icon size="18">
            <search-sharp />
          </n-icon>
        </n-button>
      </n-input-group>
    </n-grid-item>
    <n-grid-item class="align-center align-end" span="8 800:4">
      <n-menu
        v:model:value="activeKey"
        mode="horizontal"
        :options="navigationOptions"
      />
    </n-grid-item>
  </n-grid>
</template>

<script>
import { ref, h, resolveComponent } from "vue";
import {
  NGrid,
  NGridItem,
  NText,
  NDivider,
  NIcon,
  NInputGroup,
  NInput,
  NButton,
  NMenu,
} from "naive-ui";
import {
  GlobeOutline,
  SearchSharp,
  CloudUploadOutline,
  HomeOutline,
  CogOutline,
  Document,
} from "@vicons/ionicons5";

const renderIcon = (icon) => () => h(NIcon, null, { default: () => h(icon) });

const navigationOptions = [
  {
    label: () => h(resolveComponent("router-link"), { to: "/" }, () => "Home"),
    key: "home",
    icon: renderIcon(HomeOutline),
  },
  {
    label: "Import",
    key: "import",
    icon: renderIcon(CloudUploadOutline),
    children: [
      {
        label: () =>
          h(
            resolveComponent("router-link"),
            { to: "/import/mag-pdf" },
            () => "MAG PDF"
          ),
        key: "magpdf",
        icon: renderIcon(Document),
      },
      {
        label: () =>
          h(
            resolveComponent("router-link"),
            { to: "/import/mag-pdf" },
            () => "Intel PDF"
          ),
        key: "intelpdf",
        icon: renderIcon(Document),
      },
    ],
  },
  {
    label: () =>
      h(resolveComponent("router-link"), { to: "/settings" }, () => "Settings"),
    key: "settings",
    icon: renderIcon(CogOutline),
  },
];

export default {
  setup() {
    const activeKey = ref(null);

    return {
      activeKey,
      navigationOptions,
    };
  },
  components: {
    NGridItem,
    NGrid,
    NText,
    NDivider,
    GlobeOutline,
    NIcon,
    NInput,
    NInputGroup,
    NButton,
    SearchSharp,
    NMenu,
  },
};
</script>

<style scoped>
.logo {
  font-weight: bolder;
  font-size: 22px;
  padding-right: 8px;
  padding-left: 8px;
}

.align-center {
  display: flex;
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.align-end {
  justify-content: flex-end;
}
</style>
