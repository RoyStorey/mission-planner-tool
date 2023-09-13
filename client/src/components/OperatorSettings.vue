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
  <n-modal v-model:show="showEditOperator">
    <n-card
      style="width: 600px"
      title="Edit Operator"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-form
        :label-width="80"
        :model="editOperatorFormValue"
        :rules="operatorRules"
        size="large"
        ref="editOperatorFormRef"
      >
        <n-form-item label="Name" path="name">
          <n-input
            v-model:value="editOperatorFormValue.name"
            placeholder="Name"
            class="input"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space>
          <n-button
            type="primary"
            @click="editOperator"
            :loading="loadEditOperator"
            >Save</n-button
          >
          <n-button @click="closeModal">Cancel</n-button>
          <n-popconfirm @positive-click="deleteOperator">
            <template #trigger>
              <n-button type="error">Delete</n-button>
            </template>
            Are you sure you want to delete this operator?
          </n-popconfirm>
        </n-space>
      </template>
    </n-card>
  </n-modal>
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
  NModal,
  NCard,
  NSpace,
} from "naive-ui";
import { Add, Pencil } from "@vicons/ionicons5";
import axios from "axios";

const createColumns = (openEditModal) => [
  {
    title: "Edit",
    key: "edit",
    render(row) {
      return h(
        NIcon,
        {
          size: 15,
          style: "cursor: pointer;",
          onClick: () => {
            openEditModal(row);
          },
        },
        {
          default: () => h(Pencil),
          onClick: () => {
            console.log(row);
          },
        }
      );
    },
    width: "50px",
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
    const selectedOperator = ref(null);
    const showEditOperator = ref(false);
    const editOperatorFormRef = ref(null);
    const editOperatorFormValue = ref({
      name: "",
    });
    const loadEditOperator = ref(false);

    onMounted(() => {
      loadingOperators.value = true;

      axios
        .get(`/mpt-api/getOperators`)
        .then((data) => {
          loadingOperators.value = false;
          operatorOptions.value = data.data;
        })
        .catch((error) => console.log(error));
    });

    const openEditModal = (row) => {
      editOperatorFormValue.value.name = row.name;
      selectedOperator.value = row.id;
      showEditOperator.value = true;
    };

    return {
      loadEditOperator,
      showEditOperator,
      selectedOperator,
      notification,
      editOperatorFormValue,
      editOperatorFormRef,
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
      columns: createColumns(openEditModal),
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
            .post(`/mpt-api/addOperator`, {
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
    editOperator() {
      this.editOperatorFormRef.validate((errors) => {
        if (!errors) {
          this.loadEditOperator = true;

          axios
            .post(`/mpt-api/updateOperator`, {
              id: this.selectedOperator,
              name: this.editOperatorFormValue.name,
            })
            .then(() => {
              this.operatorOptions.value = this.operatorOptions.value.map(
                (option) => {
                  if (option.id === this.selectedOperator) {
                    return {
                      id: option.id,
                      name: this.editOperatorFormValue.name,
                    };
                  }
                  return option;
                }
              );

              this.loadEditOperator = false;
              this.closeModal();
            })
            .catch((error) => {
              console.log(error);
              this.loadEditOperator = false;
              this.notification.error({
                content: "An error occured editing this operator!",
                meta: error.response.data.message,
                duration: 5000,
              });
            });
        }
      });
    },
    deleteOperator() {
      axios
        .post(`/mpt-api/deleteOperator`, {
          id: this.selectedOperator,
        })
        .then(() => {
          this.operatorOptions.value = this.operatorOptions.value.filter(
            (option) => {
              console.log(option.id, this.selectedOperator);
              return option.id !== this.selectedOperator;
            }
          );

          this.showEditOperator = false;
        })
        .catch((error) => {
          this.notification.error({
            content: "An error occured deleting this operator!",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    },
    closeModal() {
      this.selectedOperator = null;
      this.showEditOperator = false;
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
    NModal,
    NCard,
    NSpace,
    NPopconfirm,
  },
};
</script>
