<template>
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
            @keyup.enter="addOperator"
            v-model:value="operatorFormValue.name"
            placeholder="Name"
            class="input"
            style="margin-right: 8px"
          />
          <n-button
            @click="addOperator"
            :loading="loadAddOperator"
            icon-placement="right"
            type="primary"
          >
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
        :data="operatorOptions.value"
        :pagination="pagination"
        :loading="loadingOperators"
      />
    </div>
  </n-collapse-item>
</template>

<script>
import { h, ref, onMounted, reactive } from "vue";
import {
  NIcon,
  NCollapseItem,
  NPopconfirm,
  NForm,
  NFormItem,
  NButton,
  NInput,
  NDataTable,
  useNotification,
} from "naive-ui";
import { Trash, Add } from "@vicons/ionicons5";
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
          trigger: () =>
            h(renderIcon(Trash), {
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
    const notification = useNotification();
    const operatorFormRef = ref(null);
    const operatorOptions = reactive([]);
    const operatorFormValue = ref({
      name: "",
    });
    const loadingOperators = ref(false);
    const loadAddOperator = ref(false);

    onMounted(() => {
      loadingOperators.value = true;

      axios
        .get(`${process.env.VUE_APP_API}/getOperators`)
        .then((data) => {
          loadingOperators.value = false;
          operatorOptions.value = data.data;
        })
        .catch((error) => console.log(error));
    });

    const deleteOperator = (row) => {
      axios
        .post(`${process.env.VUE_APP_API}/deleteOperator`, {
          id: row.id,
        })
        .then(() => {
          operatorOptions.value = operatorOptions.value.filter(
            (option) => option.id !== row.id
          );
        })
        .catch((error) => {
          notification.error({
            content: "An error occured deleting this operator!",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    };

    return {
      notification,
      operatorFormRef,
      operatorFormValue,
      operatorOptions,
      operatorRules: {
        name: [
          {
            required: true,
            message: "Please input operator name",
          },
        ],
      },
      loadAddOperator,
      loadingOperators,
      columns: createColumns(deleteOperator),
      pagination: {
        pageSize: 10,
      },
    };
  },
  methods: {
    addOperator() {
      this.operatorFormRef.validate((errors) => {
        if (!errors) {
          this.loadAddOperator = true;

          axios
            .post(`${process.env.VUE_APP_API}/addOperator`, {
              name: this.operatorFormValue.name,
            })
            .then((data) => {
              this.operatorOptions.value.push({
                id: data.data.id,
                name: this.operatorFormValue.name,
              });

              this.loadAddOperator = false;
              this.operatorFormValue = {
                name: "",
              };
            })
            .catch((error) => {
              this.loadAddOperator = false;
              this.notification.error({
                content: "An error occured adding this operator!",
                meta: error.response.data.message,
                duration: 5000,
              });
            });
        }
      });
    },
  },
  components: {
    NCollapseItem,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NIcon,
    Add,
    NDataTable,
  },
};
</script>
