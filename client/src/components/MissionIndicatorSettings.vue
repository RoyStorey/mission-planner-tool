<template>
  <n-collapse-item title="Mission Indicators">
    <n-alert type="info" title="Important!" closable style="margin-bottom: 1em">
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
        <n-form-item label="Dep. Country Codes" path="countries">
          <n-select
            v-model:value="missionIndicatorFormValue.countries"
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
          <n-button
            @click="saveConfig"
            :loading="missionIndicatorAddLoad"
            icon-placement="right"
            type="primary"
          >
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
</template>

<script>
import { ref, onMounted } from "vue";
import {
  NIcon,
  NCollapseItem,
  NForm,
  NFormItem,
  NButton,
  NSelect,
  NInputNumber,
  NAlert,
  useNotification,
} from "naive-ui";
import { Save } from "@vicons/ionicons5";
import axios from "axios";

export default {
  setup() {
    const notification = useNotification();
    const missionIndicatorFormRef = ref(null);
    const missionIndicatorFormValue = ref({
      countries: [],
      groundTime: 0,
    });
    const missionIndicatorAddLoad = ref(false);
    const loadingCountryCodes = ref(false);
    const countryCodeOptions = ref([]);

    onMounted(() => {
      loadingCountryCodes.value = true;

      axios
        .get(`${process.env.MPT_API}/getCountryCodes`)
        .then((data) => {
          loadingCountryCodes.value = false;
          countryCodeOptions.value = data.data.map((option) => ({
            label: option.alpha3,
            value: option.alpha3,
          }));
        })
        .catch((error) => console.log(error));

      axios.get(`${process.env.MPT_API}/getConfig`).then((data) => {
        missionIndicatorFormValue.value.countries = data.data.country_codes;
        missionIndicatorFormValue.value.groundTime = data.data.ground_time;
      });
    });

    return {
      notification,
      missionIndicatorAddLoad,
      missionIndicatorFormRef,
      missionIndicatorFormValue,
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
  methods: {
    saveConfig() {
      this.missionIndicatorFormRef.validate((errors) => {
        if (!errors) {
          this.missionIndicatorAddLoad = true;

          axios
            .post(`${process.env.MPT_API}/saveConfig`, {
              ...this.missionIndicatorFormValue,
            })
            .then(() => {
              this.missionIndicatorAddLoad = false;
            })
            .catch((error) => {
              this.missionIndicatorAddLoad = false;
              this.notification.error({
                content: "An error occured saving this config!",
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
    NAlert,
    NForm,
    NFormItem,
    NSelect,
    NInputNumber,
    NButton,
    NIcon,
    Save,
  },
};
</script>
