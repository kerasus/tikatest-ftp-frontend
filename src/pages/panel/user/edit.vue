<template>
  <entity-edit
    :key="entityEditKey"
    v-model:value="inputs"
    :title="label"
    :api="api"
    :entity-id-key="entityIdKey"
    :entity-param-key="entityParamKey"
    :index-route-name="indexRouteName"
    :show-route-name="showRouteName"
    :show-expand-button="false"
    :after-load-input-data="afterLoadInputData" />
  <q-separator class="q-my-md" />
  <div class="row q-col-gutter-md">
    <div class="col-md-6 col-12">
      <entity-create
        ref="entityCreateRef"
        v-model:value="resetPasswordInputs"
        :title="resetPasswordLabel"
        :api="resetPasswordApi"
        :show-save-button="false"
        :show-close-button="false"
        :show-expand-button="false">
        <template #after-form-builder>
          <q-btn
            color="primary"
            label="تغییر کلمه عبور"
            :loading="resetPasswordLoading"
            class="q-mt-md"
            @click="resetPassword" />
        </template>
      </entity-create>
    </div>
    <div
      v-if="userManager.isAdmin"
      class="col-md-6 col-12">
      <q-card>
        <q-card-section>
          <role-list
            v-if="userData"
            :user="userData"
            :edit-mode="true"
            @change="onChangeUserRole" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from 'stores/user'
import RoleList from 'src/components/roleList.vue'
import { EntityEdit, EntityCreate } from 'quasar-crud'
import UserAPI, { type UserType } from 'src/repositories/user'

const $q = useQuasar()
const route = useRoute()
const userManager = useUser()
const userAPI = new UserAPI()

const entityCreateRef = ref()
const resetPasswordLoading = ref(false)
const entityEditKey = ref(Date.now())
const userData = ref<UserType | null>(null)
const userId = computed(() => (route.params.id ? parseInt(route.params.id?.toString()) : 0))
const api = ref(userAPI.endpoints.byId(userId.value))
const label = ref('مشاهده کاربر')
const indexRouteName = ref('Panel.User.List')
const showRouteName = ref('Panel.User.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')
const inputs = ref([
  {
    type: 'hidden',
    name: 'id',
    responseKey: 'id'
  },
  {
    type: 'input',
    name: 'firstname',
    responseKey: 'firstname',
    label: 'نام',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'lastname',
    responseKey: 'lastname',
    label: 'نام خانوادگی',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  { type: 'separator', name: 'space', size: '0', col: 'col-md-12' },
  {
    type: 'input',
    name: 'username',
    responseKey: 'username',
    label: 'نام کاربری',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'mobile',
    responseKey: 'mobile',
    label: 'تلفن همراه',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'input',
    name: 'email',
    responseKey: 'email',
    label: 'ایمیل',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  }
])

const resetPasswordApi = ref(userAPI.endpoints.resetPassword(userId.value))
const resetPasswordLabel = ref('تغییر کلمه عبور')
const resetPasswordInputs = ref([
  {
    type: 'input',
    name: 'new_password',
    label: 'کلمه عبور جدید',
    placeholder: ' ',
    col: 'col-md-6 col-12'
  },
  {
    type: 'input',
    name: 'new_password_confirmation',
    label: 'تکرار کلمه عبور جدید',
    placeholder: ' ',
    col: 'col-md-6 col-12'
  }
])

function afterLoadInputData (data: UserType) {
  userData.value = data
}

function onChangeUserRole () {
  entityEditKey.value = Date.now()
}

async function resetPassword () {
  resetPasswordLoading.value = true
  try {
    const result = await entityCreateRef.value.createEntity(false)
    $q.notify({
      message: result.data.message,
      type: 'positive'
    })
  } finally {
    resetPasswordLoading.value = false
  }
}
</script>
