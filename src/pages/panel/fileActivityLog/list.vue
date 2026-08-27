<template>
  <entity-index
    ref="entityIndexRef"
    :value="inputs"
    :title="label"
    :api="api"
    :table="table"
    :table-keys="tableKeys"
    :show-create-button="false"
    :show-close-button="false"
    :show-expand-button="false"
    :show-reload-button="true"
    :show-search-button="true"
    :row-key="itemIdentifyKey">

    <template #entity-index-table-cell="{ inputData }">
      <!-- ستون اکشن/عملیات با برچسب رنگی -->
      <template v-if="inputData.col.name === 'action'">
        <q-chip
          dense
          square
          :color="getActionBadgeColor(inputData.props.row.action)"
          text-color="white">
          {{ getFileActivityActionLabel(inputData.props.row.action) }}
        </q-chip>
      </template>

      <!-- ستون وضعیت عملیات -->
      <template v-else-if="inputData.col.name === 'status'">
        <q-badge
          :color="inputData.props.row.status === 'success' ? 'positive' : 'negative'"
          :label="getFileActivityStatusLabel(inputData.props.row.status)" />
      </template>

      <!-- ستون کاربر -->
      <template v-else-if="inputData.col.name === 'user'">
        <span v-if="inputData.props.row.user">
          {{ `${inputData.props.row.user.firstname ?? ''} ${inputData.props.row.user.lastname ?? ''}`.trim() || inputData.props.row.user.username }}
        </span>
        <span
          v-else
          class="text-grey-6">-</span>
      </template>

      <!-- ستون حجم فایل -->
      <template v-else-if="inputData.col.name === 'file_size'">
        <span>{{ formatBytes(inputData.props.row.file_size) }}</span>
      </template>

      <!-- ستون عملیات دکمه مشاهده جزئیات -->
      <template v-else-if="inputData.col.name === 'actions'">
        <div class="action-column-entity-index">
          <q-btn
            color="primary"
            flat
            dense
            icon="visibility"
            @click="showDetails(inputData.props.row)">
            <q-tooltip>
              مشاهده جزئیات لاگ
            </q-tooltip>
          </q-btn>
        </div>
      </template>

      <template v-else>
        {{ inputData.col.value }}
      </template>
    </template>
  </entity-index>

  <!-- مودال مشاهده جزئیات لاگ و خطا -->
  <q-dialog v-model="detailsDialog.show">
    <q-card style="min-width: 480px; max-width: 800px; width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">جزئیات گزارش لاگ #{{ detailsDialog.item?.id }}</div>
        <q-space />
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense />
      </q-card-section>

      <q-card-section
        v-if="detailsDialog.item"
        class="q-pa-md">
        <q-list
          separator
          bordered
          class="rounded-borders">
          <q-item>
            <q-item-section
              class="text-weight-bold"
              side>نوع عملیات:</q-item-section>
            <q-item-section>{{ getFileActivityActionLabel(detailsDialog.item.action) }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section
              class="text-weight-bold"
              side>وضعیت:</q-item-section>
            <q-item-section>
              <q-badge
                :color="detailsDialog.item.status === 'success' ? 'positive' : 'negative'"
                :label="getFileActivityStatusLabel(detailsDialog.item.status)" />
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.user">
            <q-item-section
              class="text-weight-bold"
              side>کاربر:</q-item-section>
            <q-item-section>
              {{ detailsDialog.item.user.firstname }} {{ detailsDialog.item.user.lastname }} ({{ detailsDialog.item.user.username }})
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.file_name">
            <q-item-section
              class="text-weight-bold"
              side>نام فایل:</q-item-section>
            <q-item-section
              class="text-body2 text-grey-9"
              style="direction: ltr; text-align: right;">
              {{ detailsDialog.item.file_name }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.path">
            <q-item-section
              class="text-weight-bold"
              side>مسیر:</q-item-section>
            <q-item-section
              class="text-body2"
              style="direction: ltr; text-align: right;">
              {{ detailsDialog.item.path }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.source_path">
            <q-item-section
              class="text-weight-bold"
              side>مسیر مبدا:</q-item-section>
            <q-item-section
              class="text-body2"
              style="direction: ltr; text-align: right;">
              {{ detailsDialog.item.source_path }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.destination_path">
            <q-item-section
              class="text-weight-bold"
              side>مسیر مقصد:</q-item-section>
            <q-item-section
              class="text-body2"
              style="direction: ltr; text-align: right;">
              {{ detailsDialog.item.destination_path }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.upload_id">
            <q-item-section
              class="text-weight-bold"
              side>Upload ID:</q-item-section>
            <q-item-section
              class="text-caption"
              style="direction: ltr; text-align: right;">
              {{ detailsDialog.item.upload_id }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.ip_address">
            <q-item-section
              class="text-weight-bold"
              side>آدرس IP:</q-item-section>
            <q-item-section style="direction: ltr; text-align: right;">
              {{ detailsDialog.item.ip_address }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.error_message">
            <q-item-section
              class="text-weight-bold text-negative"
              side>متن خطا:</q-item-section>
            <q-item-section
              class="text-negative text-caption text-bold"
              style="white-space: pre-wrap; direction: ltr; text-align: left;">
              {{ detailsDialog.item.error_message }}
            </q-item-section>
          </q-item>

          <q-item v-if="detailsDialog.item.meta">
            <q-item-section
              class="text-weight-bold"
              side>متادیتا (JSON):</q-item-section>
            <q-item-section>
              <pre
                class="bg-grey-2 q-pa-sm rounded-borders text-caption"
                style="max-height: 180px; overflow: auto; direction: ltr;">{{ JSON.stringify(detailsDialog.item.meta, null, 2) }}</pre>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { EntityIndex } from 'quasar-crud'
import FileActivityLogAPI, {
  type FileActivityLogType,
  fileActivityActionOptions,
  fileActivityStatusOptions,
  getFileActivityActionLabel,
  getFileActivityStatusLabel
} from 'src/repositories/fileActivityLog'
import { useDate } from 'src/composables/Date'
import FormBuilderDateTime from 'src/components/controls/formBuilderCustomInput/FormBuilderDateTime.vue'
import FormBuilderSelectUser from 'src/components/controls/formBuilderCustomInput/FormBuilderSelectUser.vue'

const dateManager = useDate()
const fileActivityLogAPI = new FileActivityLogAPI()
const FormBuilderDateTimeComponent = shallowRef(FormBuilderDateTime)
const FormBuilderSelectUserComponent = shallowRef(FormBuilderSelectUser)

const api = ref(fileActivityLogAPI.endpoints.base)
const label = ref('گزارش فعالیت فایل‌ها')
const itemIdentifyKey = ref('id')

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
      name: 'id',
      label: 'شناسه',
      align: 'left',
      field: (row: FileActivityLogType) => row.id
    },
    {
      name: 'user',
      label: 'کاربر',
      align: 'left',
      field: (row: FileActivityLogType) => row.user ? `${row.user.firstname ?? ''} ${row.user.lastname ?? ''}`.trim() || row.user.username : '-'
    },
    {
      name: 'action',
      label: 'عملیات',
      align: 'center',
      field: (row: FileActivityLogType) => row.action
    },
    {
      name: 'status',
      label: 'وضعیت',
      align: 'center',
      field: (row: FileActivityLogType) => row.status
    },
    {
      name: 'file_name',
      label: 'نام فایل',
      align: 'left',
      field: (row: FileActivityLogType) => row.file_name || '-'
    },
    {
      name: 'path',
      label: 'مسیر',
      align: 'left',
      field: (row: FileActivityLogType) => row.path || row.destination_path || '-'
    },
    {
      name: 'file_size',
      label: 'حجم فایل',
      align: 'center',
      field: (row: FileActivityLogType) => row.file_size
    },
    {
      name: 'ip_address',
      label: 'IP',
      align: 'center',
      field: (row: FileActivityLogType) => row.ip_address || '-'
    },
    {
      name: 'created_at',
      label: 'تاریخ و زمان',
      align: 'left',
      field: (row: FileActivityLogType) => row.created_at
        ? dateManager.isoToLocalShamsiDateTime(row.created_at)
        : '-'
    },
    {
      name: 'actions',
      label: 'جزئیات',
      align: 'center',
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
    value: 20
  },
  {
    type: FormBuilderSelectUserComponent,
    name: 'user_id',
    col: 'col-md-2 col-12'
  },
  // {
  //   type: 'input',
  //   name: 'file_name',
  //   label: 'نام فایل',
  //   placeholder: ' ',
  //   col: 'col-md-3 col-12'
  // },
  // {
  //   type: 'input',
  //   name: 'path',
  //   label: 'مسیر',
  //   placeholder: ' ',
  //   col: 'col-md-3 col-12'
  // },
  {
    type: FormBuilderDateTimeComponent,
    name: 'createdSinceDate',
    label: 'از تاریخ و ساعت',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: FormBuilderDateTimeComponent,
    name: 'createdTillDate',
    label: 'تا تاریخ و ساعت',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'select',
    name: 'action',
    label: 'عملیات',
    placeholder: 'انتخاب کنید',
    options: [
      ...fileActivityActionOptions
    ],
    col: 'col-md-2 col-12'
  },
  {
    type: 'select',
    name: 'status',
    label: 'وضعیت',
    placeholder: 'انتخاب کنید',
    options: [
      ...fileActivityStatusOptions
    ],
    col: 'col-md-2 col-12'
  }
])

const entityIndexRef = ref()
const detailsDialog = ref<{ show: boolean; item: FileActivityLogType | null }>({
  show: false,
  item: null
})

function showDetails (row: FileActivityLogType) {
  detailsDialog.value.item = row
  detailsDialog.value.show = true
}

function getActionBadgeColor (action: string | null): string {
  switch (action) {
    case 'upload':
      return 'teal-7'
    case 'delete':
      return 'red-7'
    case 'rename':
      return 'amber-9'
    case 'move':
      return 'deep-purple-6'
    default:
      return 'blue-grey-7'
  }
}

function formatBytes (bytes: number | null): string {
  if (!bytes || bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
</script>
