<template>
  <n-card title="Operators Assigned" style="margin-bottom: 1em">
    <n-select
      v-model:value="assignedOperators"
      :options="operatorOptions"
      filterable
      clearable
      :loading="loadingOperators"
      multiple
      placeholder="Select an operator"
      style="width: 100%"
      @blur="updateAssignedOperators"
    />
  </n-card>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import { NCard, NSelect, useNotification } from "naive-ui";
import axios from "axios";

export default {
  props: ["missionData"],
  setup(props) {
    const notification = useNotification();
    const assignedOperators = ref([]);
    const operatorOptions = ref([]);
    const loadingOperators = ref(false);

    watch(
      () => props.missionData,
      () => {
        assignedOperators.value = props.missionData.operators;
      }
    );

    onMounted(() => {
      loadingOperators.value = true;
      axios
        .get(`${process.env.VUE_APP_API}/getOperators`)
        .then((data) => {
          loadingOperators.value = false;
          operatorOptions.value = data.data.map((operator) => ({
            label: operator.name,
            value: operator.id,
          }));
        })
        .catch((error) => console.log(error));
    });

    return {
      notification,
      assignedOperators,
      operatorOptions,
      loadingOperators,
    };
  },
  methods: {
    updateAssignedOperators() {
      axios
        .post(`${process.env.VUE_APP_API}/updateMission`, {
          id: this.missionData.id,
          operators: this.assignedOperators,
        })
        .catch((error) => {
          this.notification.error({
            content: "An error occured",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    },
  },
  components: {
    NCard,
    NSelect,
  },
};
</script>
