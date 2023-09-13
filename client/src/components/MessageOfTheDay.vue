<template>
  <n-card
    title="MOTD"
    size="small"
    header-style="padding-bottom:0px"
    style="min-height: 107px"
  >
    <template #header-extra>
      <n-icon v-if="!edit" @click="setEdit" style="cursor: pointer">
        <pencil />
      </n-icon>
      <n-icon style="cursor: pointer" v-else>
        <checkmark @click="saveMOTD" />
      </n-icon>
    </template>
    <div v-if="!edit">
      {{ motd }}
    </div>
    <div v-else>
      <n-input
        clearable
        @keydown.enter="saveMOTD"
        v-model:value="motd"
        type="text"
      />
    </div>
  </n-card>
</template>

<script>
import { ref, onMounted } from "vue";
import { NCard, useNotification, NIcon, NInput } from "naive-ui";
import { Pencil, Checkmark } from "@vicons/ionicons5";
import axios from "axios";

export default {
  setup() {
    const motd = ref(null);
    const edit = ref(false);
    const notification = useNotification();

    onMounted(() => {
      axios
        .get(`/mpt-api/getMOTD`)
        .then((data) => {
          motd.value = data.data.text;
        })
        .catch((error) => {
          notification.error({
            content: "An error occured recieving upcoming mission stats!",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    });

    return {
      motd,
      edit,
    };
  },
  methods: {
    setEdit() {
      this.edit = true;
    },
    saveMOTD() {
      axios
        .post(`/mpt-api/updateMOTD`, {
          text: this.motd,
        })
        .then(() => {
          this.edit = false;
        })
        .catch((error) => {
          this.notification.error({
            content: "An error occured saving MOTD!",
            meta: error.response.data.message,
            duration: 5000,
          });
        });
    },
  },
  components: {
    NCard,
    NIcon,
    Pencil,
    NInput,
    Checkmark,
  },
};
</script>
