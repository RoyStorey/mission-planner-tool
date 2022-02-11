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
        <n-collapse-item title="Operators">
          <div>
            <n-form
              :label-width="80"
              :model="operatorFormValue"
              :rules="operatorRules"
              size="large"
              ref="operatorFormRef"
            >
              <n-form-item label="Add Operator" path="name">
                <n-input
                  v-model:value="operatorFormValue.name"
                  placeholder="Name"
                  class="input"
                  style="margin-right: 8px"
                />
                <n-button icon-placement="right" type="primary">
                  <template #icon>
                    <n-icon>
                      <add />
                    </n-icon>
                  </template>
                  Add
                </n-button>
              </n-form-item>
            </n-form>
            <n-data-table
              size="small"
              :columns="columns"
              :data="operatorOptions"
              :pagination="pagination"
            />
          </div>
        </n-collapse-item>
        <n-collapse-item title="Mission Indicators">
          <n-alert
            type="info"
            title="Important!"
            closable
            style="margin-bottom: 1em"
          >
            These settings are the ones that will decide which missions will be
            selected as candidates when parsing the PDF documents.
          </n-alert>
          <div>
            <n-form
              :label-width="80"
              :model="missionIndicatorFormValue"
              :rules="missionIndicatorRules"
              size="large"
              ref="missionIndicatorFormRef"
            >
              <n-form-item label="Country Codes" path="countries">
                <n-select
                  v-model:value="missionIndicatorFormValue.name"
                  class="input"
                  style="margin-right: 8px"
                  multiple
                  :options="countryCodeOptions"
                  :loading="loadingCountryCodes"
                  filterable
                  tag
                />
              </n-form-item>
              <n-form-item label="Ground Time (hrs)" path="groundTime">
                <n-input-number
                  v-model:value="missionIndicatorFormValue.groundTime"
                  style="margin-right: 8px; flex-basis: 100%"
                  clearable
                />
                <n-button icon-placement="right" type="primary">
                  <template #icon>
                    <n-icon>
                      <save />
                    </n-icon>
                  </template>
                  Update
                </n-button>
              </n-form-item>
            </n-form>
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-card>
  </div>
</template>

<script>
import { h, ref, onMounted } from "vue";
import {
  NH1,
  NIcon,
  NCollapse,
  NCollapseItem,
  NCard,
  useLoadingBar,
  NPopconfirm,
  NForm,
  NFormItem,
  NButton,
  NInput,
  NDataTable,
  NSelect,
  NInputNumber,
  NAlert,
} from "naive-ui";
import { Cog, Trash, Add, Save } from "@vicons/ionicons5";
import axios from "axios";

const renderIcon = (icon) => {
  return () => h(NIcon, { size: "15" }, { default: () => h(icon) });
};

const createColumns = (deleteOperator) => [
  {
    title: "Delete",
    key: "delete",
    render(row) {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => {
            deleteOperator(row);
          },
        },
        {
          trigger: h(renderIcon(Trash), {
            style: "cursor: pointer;",
          }),
          default: () => "Are you sure you want to delete this operator?",
        }
      );
    },
    width: 100,
  },
  {
    title: "Name",
    key: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortOrder: "ascend",
  },
];

export default {
  setup() {
    const operatorFormRef = ref(null);
    const missionIndicatorFormRef = ref(null);
    const operatorOptions = ref([]);
    const loadingBar = useLoadingBar();

    const loadingCountryCodes = ref(false);
    const countryCodeOptions = ref([]);

    loadingBar.start();

    onMounted(() => {
      loadingCountryCodes.value = true;
      axios
        .get(`${process.env.VUE_APP_API}/getCountryCodes`)
        .then((data) => {
          loadingCountryCodes.value = false;
          countryCodeOptions.value = data.data.map((option) => ({
            label: option.alpha3,
            value: option.alpha3,
          }));
        })
        .catch((error) => {
          console.log(error);
        });

      setTimeout(() => {
        loadingBar.finish();
      }, 1000);
    });

    return {
      operatorFormRef,
      operatorFormValue: ref({
        name: "",
      }),
      operatorOptions,
      operatorRules: {
        name: [
          {
            required: true,
            message: "Please input operator name",
          },
        ],
      },
      columns: createColumns(() => {}),
      pagination: {
        pageSize: 10,
      },
      missionIndicatorFormRef,
      missionIndicatorFormValue: ref({
        countries: [],
        groundTime: 0,
      }),
      countryCodeOptions,
      missionIndicatorRules: {
        countries: [
          {
            required: true,
            message: "Please select at least one country",
          },
        ],
        groundTime: [
          {
            required: true,
            message: "Please input ground time",
          },
        ],
      },
      loadingCountryCodes,
    };
  },
  components: {
    NH1,
    NIcon,
    Cog,
    NCard,
    NCollapse,
    NCollapseItem,
    NForm,
    NFormItem,
    NButton,
    NInput,
    Add,
    NDataTable,
    NSelect,
    NInputNumber,
    Save,
    NAlert,
  },
};
</script>
