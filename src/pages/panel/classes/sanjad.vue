<template>
  <entity-index
    ref="entityIndexRef"
    :value="inputs"
    :title="label"
    :api="api"
    :table="table"
    :table-keys="tableKeys"
    :show-close-button="false"
    :show-expand-button="false"
    :show-reload-button="false"
    :show-search-button="true"
    :row-key="itemIdentifyKey">
    <template #toolbar>
      <q-btn
        flat
        round
        icon="search"
        @click="entityIndexRef?.search()">
        <q-tooltip>جستجو</q-tooltip>
      </q-btn>
      <q-btn
        color="primary"
        icon="sync"
        label="به‌روزرسانی کلاس‌ها"
        :loading="syncLoading"
        @click="syncClasses" />
      <q-btn
        flat
        round
        icon="cached"
        @click="entityIndexRef?.reload()">
        <q-tooltip>بارگذاری مجدد</q-tooltip>
      </q-btn>
    </template>

    <template #entity-index-table-cell="{ inputData }">
      <template v-if="inputData.col.name === 'actions'">
        <q-btn
          color="secondary"
          flat
          icon="visibility"
          :disable="inputData.props.row.is_deleted_at_source"
          @click="openPermissions(inputData.props.row)">
          <q-tooltip>مدیریت دسترسی مشاهده فایل‌ها</q-tooltip>
        </q-btn>
      </template>
      <template v-else-if="inputData.col.name === 'is_deleted_at_source'">
        <q-chip
          dense
          :color="inputData.props.row.is_deleted_at_source ? 'negative' : 'positive'"
          text-color="white">
          {{ inputData.props.row.is_deleted_at_source ? 'حذف‌شده در سنجاد' : 'فعال' }}
        </q-chip>
      </template>
      <template v-else>
        {{ inputData.col.value ?? '-' }}
      </template>
    </template>
  </entity-index>

  <q-dialog
    v-model="permissionsDialog"
    persistent>
    <sanjad-class-permissions
      v-if="selectedClass"
      :sanjad-class="selectedClass"
      @close="closePermissions" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { EntityIndex } from 'quasar-crud'
import SanjadClassPermissions from 'src/components/SanjadClassPermissions.vue'
import SanjadConnectorAPI, { type SanjadClassType } from 'src/repositories/sanjadConnector'

const $q = useQuasar()
const sanjadConnectorAPI = new SanjadConnectorAPI()
const entityIndexRef = ref()
const api = ref(sanjadConnectorAPI.endpoints.databaseClasses)
const label = ref('کلاس‌های سنجاد')
const itemIdentifyKey = ref('id')
const syncLoading = ref(false)
const permissionsDialog = ref(false)
const selectedClass = ref<SanjadClassType | null>(null)

const tableKeys = ref({
  data: 'data',
  total: 'total',
  currentPage: 'current_page',
  perPage: 'per_page',
  pageKey: 'page'
})

const table = ref({
  columns: [
    {
      name: 'sanjad_class_id',
      required: true,
      label: 'شناسه سنجاد',
      align: 'left',
      field: (row: SanjadClassType) => row.sanjad_class_id
    },
    {
      name: 'name',
      required: true,
      label: 'نام کلاس',
      align: 'left',
      field: (row: SanjadClassType) => row.name
    },
    {
      name: 'academic_level_name',
      required: true,
      label: 'مقطع تحصیلی',
      align: 'left',
      field: (row: SanjadClassType) => row.academic_level_name
    },
    {
      name: 'academic_field_name',
      required: true,
      label: 'رشته تحصیلی',
      align: 'left',
      field: (row: SanjadClassType) => row.academic_field_name
    },
    {
      name: 'is_deleted_at_source',
      required: true,
      label: 'وضعیت',
      align: 'left',
      field: (row: SanjadClassType) => row.is_deleted_at_source
    },
    {
      name: 'actions',
      required: true,
      label: 'عملیات',
      align: 'left',
      field: () => ''
    }
  ]
})

const inputs = ref([
  {
    type: 'hidden',
    name: 'sortation_field',
    value: 'created_at'
  },
  {
    type: 'hidden',
    name: 'sortation_order',
    value: 'desc'
  },
  {
    type: 'hidden',
    name: 'length',
    value: 30
  },
  {
    type: 'input',
    name: 'name',
    label: 'نام کلاس',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'academic_level_name',
    label: 'مقطع تحصیلی',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'academic_field_name',
    label: 'رشته تحصیلی',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  }
])

async function syncClasses () {
  syncLoading.value = true

  try {
    const result = await sanjadConnectorAPI.syncClasses()
    $q.notify({
      type: 'positive',
      message: result.message,
      caption: `جدید: ${result.created_count}، به‌روزشده: ${result.updated_count}، حذف‌شده: ${result.deleted_count}`
    })
    entityIndexRef.value?.reload()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در به‌روزرسانی کلاس‌های سنجاد',
      caption: error instanceof Error ? error.message : 'خطای نامشخص'
    })
  } finally {
    syncLoading.value = false
  }
}

function openPermissions (sanjadClass: SanjadClassType) {
  selectedClass.value = sanjadClass
  permissionsDialog.value = true
}

function closePermissions () {
  permissionsDialog.value = false
  selectedClass.value = null
}
</script>
