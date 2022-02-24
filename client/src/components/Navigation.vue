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
        <n-input
          v-model:value="searchQuery"
          @keyup.enter="search"
          placeholder="mission number, airport, from, to..."
        />
        <n-button @click="search" type="primary">
          <n-icon size="18">
            <search-sharp />
          </n-icon>
        </n-button>
      </n-input-group>
    </n-grid-item>
    <n-grid-item class="align-center align-end" span="8 800:4">
      <n-menu
        :value="activeKey"
        mode="horizontal"
        :options="navigationOptions"
      />
    </n-grid-item>
  </n-grid>
</template>

<script>
import { ref, h, resolveComponent, watch } from "vue";
import { useRoute } from "vue-router";
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
  Pencil,
  BarChartOutline,
} from "@vicons/ionicons5";

const renderIcon = (icon) => () => h(NIcon, null, { default: () => h(icon) });

const navigationOptions = [
  {
    label: () => h(resolveComponent("router-link"), { to: "/" }, () => "Home"),
    key: "home",
    icon: renderIcon(HomeOutline),
  },
  {
    label: () =>
      h(resolveComponent("router-link"), { to: "/missions" }, () => "Missions"),
    key: "missions",
    icon: renderIcon(BarChartOutline),
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
            { to: "/import/single-mission" },
            () => "Manual Entry"
          ),
        key: "manualentry",
        icon: renderIcon(Pencil),
      },
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
    const route = useRoute();
    const activeKey = ref(null);
    const searchQuery = ref("");

    watch(
      () => route.path,
      (path) => {
        activeKey.value =
          navigationOptions.find((option) => path.includes(option.key))?.key ??
          "home";
      }
    );

    watch(
      () => route.query,
      (query) => {
        searchQuery.value = query.query ?? "";
      }
    );

    return {
      activeKey,
      navigationOptions,
      searchQuery,
    };
  },
  methods: {
    search() {
      if (!this.searchQuery) this.$router.push("/missions");
      else
        this.$router.push(
          `/missions?query=${this.searchQuery}${
            this.$route.query.date ? `&date=${this.$route.query.date}` : ""
          }`
        );
    },
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
