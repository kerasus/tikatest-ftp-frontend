<template>
  <div class="q-pa-md">

    <q-card
      flat
      bordered
      class="q-pa-md">
      انتخاب فایل ویدیویی
      <q-file
        v-model="selectedFile"
        clearable
        class="q-mb-md"
        @update:model-value="handleFileSelect">
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <div class="row items-start q-mb-md">
        <q-btn
          flat
          dense
          color="primary"
          icon="refresh"
          label="به‌روزرسانی تنظیمات"
          :loading="optionsCacheClearing"
          :disable="optionsLoading || uploading"
          @click="refreshOptionsCache">
          <q-tooltip>پاک کردن کش تنظیمات و دریافت مجدد لیست‌ها</q-tooltip>
        </q-btn>
      </div>


      <div class="row q-col-gutter-md q-mb-md">
        <div
          v-if="optionsLoading"
          class="col-12">
          در حال گرفتن تنظیمات ...
        </div>
        <template v-else>
          <div class="col-12 col-md-4">
            انتخاب فصل
            <q-select
              v-model="selectedSeason"
              :options="seasonOptions"
              emit-value
              map-options
              options-dense
              outlined
              dense
              @update:model-value="onSeasonChange" />
          </div>
          <div class="col-12 col-md-4">
            انتخاب درس
            <q-select
              v-model="selectedLesson"
              :options="lessonOptions"
              emit-value
              map-options
              options-dense
              outlined
              dense
              :disable="!selectedSeason"
              @update:model-value="onLessonChange" />
          </div>
          <div class="col-12 col-md-4">
            انتخاب پایه
            <q-select
              v-model="selectedGrade"
              :options="gradeOptions"
              emit-value
              map-options
              options-dense
              outlined
              dense
              :disable="!selectedLesson" />
          </div>
        </template>
      </div>

      <div
        v-if="selectedFile"
        class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">اطلاعات فایل:</div>
        <q-list
          bordered
          separator>
          <q-item>
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="description" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>نام فایل</q-item-label>
              <q-item-label>{{ selectedFile.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="sd_storage" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>حجم فایل</q-item-label>
              <q-item-label>{{ formatFileSize(selectedFile.size) }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon
                color="primary"
                name="category" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>نوع فایل</q-item-label>
              <q-item-label>{{ selectedFile.type }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div
        v-if="previewUrl"
        class="q-mb-md">
        <div class="text-subtitle1 q-mb-sm">پیش‌نمایش:</div>
        <video
          :src="previewUrl"
          controls
          width="100%"
          style="max-height: 400px; border-radius: 8px; background: #000;" />
      </div>

      <!-- نوار پیشرفت آپلود -->
      <div
        v-if="uploading"
        class="q-mb-md">
        <q-linear-progress
          :value="uploadProgress"
          color="primary" />
        <div class="text-caption q-mt-xs text-center">
          {{ uploadPercentage }}% - {{ formatFileSize(uploadedBytes) }} از {{ formatFileSize(totalSize) }}
          <br>
          در حال آپلود تکه {{ currentChunkIndex + 1 }} از {{ totalChunks }}
        </div>
      </div>

      <q-btn
        v-if="selectedFile && selectedSeason && selectedLesson && selectedGrade"
        color="primary"
        label="آپلود فایل"
        icon="cloud_upload"
        :loading="uploading"
        class="full-width"
        @click="handleUpload" />
      <q-btn
        v-if="uploading"
        color="negative"
        label="لغو آپلود"
        icon="cancel"
        class="full-width"
        @click="cancelUpload" />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import FileAPI from 'src/repositories/file'
import { onMounted, ref, computed } from 'vue'

// تنظیمات آپلود
const CHUNK_SIZE = 1 * 1024 * 1024 // 1 مگابایت

const $q = useQuasar()
const fileAPI = new FileAPI()

let abortController: AbortController | null = null

const optionsLoading = ref(false)
const currentUploadId = ref<string | null>(null)
type OptionsType = Record<string, Record<string, string[]>>
const apiOptions = ref<OptionsType>({})
const selectedSeason = ref<string | null>(null)
const selectedLesson = ref<string | null>(null)
const selectedGrade = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const uploadPercentage = ref<number>(0)
const currentChunkIndex = ref<number>(0)
const totalChunks = ref<number>(0)
const uploadedBytes = ref<number>(0)
const totalSize = ref<number>(0)
const optionsCacheClearing = ref(false)

// --- Computed Properties برای ساخت لیست‌ها ---

const seasonOptions = computed(() => {
  const options = apiOptions.value

  if (!options || typeof options !== 'object') {
    return []
  }

  return Object.keys(options).map((season) => ({
    label: season,
    value: season
  }))
})
const lessonOptions = computed(() => {
  if (!selectedSeason.value || !apiOptions.value[selectedSeason.value]) {
    return []
  }
  const lessons = apiOptions.value[selectedSeason.value]
  return Object.keys(lessons).map((lesson) => ({
    label: lesson,
    value: lesson
  }))
})
const gradeOptions = computed(() => {
  if (!selectedSeason.value || !selectedLesson.value || !apiOptions.value[selectedSeason.value]) {
    return []
  }
  const grades = apiOptions.value[selectedSeason.value][selectedLesson.value]
  // تبدیل آرایه رشته‌ای به آرایه آبجکت برای q-select
  return grades.map((grade) => ({
    label: grade,
    value: grade
  }))
})

// --- متدها ---

const onSeasonChange = () => {
  selectedLesson.value = null
  selectedGrade.value = null
}

const onLessonChange = () => {
  selectedGrade.value = null
}

const handleFileSelect = (file: File) => {
  selectedFile.value = file
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function getOptions () {
  try {
    optionsLoading.value = true
    const result = await fileAPI.getOptions()

    const options = result?.data ?? result ?? {}

    if (
      typeof options === 'object' &&
      !Array.isArray(options)
    ) {
      apiOptions.value = options as OptionsType
    } else {
      apiOptions.value = {}
    }
  } catch (error) {
    console.error('Error fetching options:', error)
    apiOptions.value = {}

    $q.notify({
      type: 'negative',
      message: 'خطا در دریافت تنظیمات آپلود'
    })
  } finally {
    optionsLoading.value = false
  }
}

/**
 * تولید یک شناسه یکتا برای آپلود
 */
const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function cancelUpload () {
  if (abortController) {
    abortController.abort()

    try {
      await fileAPI.cancel(currentUploadId.value)
    } catch (e) {
      console.warn('Cancel API failed (maybe offline)')
    }

    uploading.value = false
    $q.notify({
      type: 'warning',
      message: 'آپلود توسط کاربر لغو شد.',
      position: 'top'
    })
  }
}

async function uploadChunkWithRetry (
  formData: FormData,
  signal: AbortSignal,
  maxAttempts = 3
) {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fileAPI.uploadChunk(formData, signal)
    } catch (error) {
      lastError = error

      if (signal.aborted) {
        throw error
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
      }
    }
  }

  throw lastError
}

/**
 * هندل کردن دکمه آپلود
 */
const handleUpload = async () => {
  if (!selectedFile.value) return

  abortController = new AbortController()
  const signal = abortController.signal

  const season = selectedSeason.value
  const lesson = selectedLesson.value
  const grade = selectedGrade.value

  const file = selectedFile.value
  totalSize.value = file.size
  uploadedBytes.value = 0
  const chunksCount = Math.ceil(totalSize.value / CHUNK_SIZE)

  // ریست کردن متغیرها
  uploading.value = true
  uploadProgress.value = 0
  uploadPercentage.value = 0
  totalChunks.value = chunksCount
  currentChunkIndex.value = 0

  currentUploadId.value = generateUploadId()

  try {
    // حلقه برای ارسال تکه‌ها
    for (let i = 0; i < chunksCount; i++) {
      currentChunkIndex.value = i

      // بررسی اینکه آیا کاربر لغو کرده است؟
      if (signal.aborted) {
        throw new Error('Upload cancelled by user')
      }

      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, totalSize.value)
      const chunkBlob = file.slice(start, end)

      // ساخت FormData
      const formData = new FormData()
      formData.append('upload_id', currentUploadId.value)
      formData.append('chunk_index', i.toString())
      formData.append('total_chunks', chunksCount.toString())
      formData.append('total_size', totalSize.value.toString())
      formData.append('filename', file.name)
      formData.append('season', season)
      formData.append('lesson', lesson)
      formData.append('grade', grade)
      formData.append('chunk', chunkBlob)

      // const response = await fileAPI.uploadChunk(formData, signal)
      const response = await uploadChunkWithRetry(
        formData,
        signal,
        3
      )


      if (!response || typeof response !== 'object') {
        $q.notify({
          type: 'negative',
          message: 'پاسخ معتبر از سرور دریافت نشد.',
          position: 'top'
        })
        throw new Error('پاسخ معتبر از سرور دریافت نشد.')
      }

      uploadedBytes.value += chunkBlob.size
      // محاسبه درصد پیشرفت بر اساس بایت
      uploadProgress.value = uploadedBytes.value / totalSize.value
      uploadPercentage.value = Math.round(uploadProgress.value * 100)

      // // آپدیت نوار پیشرفت
      // uploadProgress.value = (i + 1) / chunksCount
      // uploadPercentage.value = Math.round(((i + 1) / chunksCount) * 100)

      // اگر آپلود کامل شده بود
      if (response.complete) {
        if (!response.file_info?.filename) {
          $q.notify({
            type: 'negative',
            message: 'پاسخ تکمیل آپلود ناقص است.',
            position: 'top'
          })
          throw new Error('پاسخ تکمیل آپلود ناقص است.')
        }

        $q.notify({
          type: 'positive',
          message: `فایل ${response.file_info.filename} با موفقیت آپلود شد.`,
          position: 'top',
          closeBtn: true,
          timeout: 0
        })
        break // خروج از حلقه
      }
    }
  } catch (error: any) {
    if (error.message !== 'Upload cancelled by user') {
      console.error('Upload Error:', {
        chunkIndex: currentChunkIndex.value,
        totalChunks: totalChunks.value,
        uploadId: currentUploadId.value,
        error
      })
      $q.notify({
        type: 'negative',
        message: `آپلود تکه ${currentChunkIndex.value + 1} شکست خورد.` + error.message,
        position: 'top'
      })
    }
  } finally {
    uploading.value = false
    abortController = null
  }
}

async function refreshOptionsCache () {
  try {
    optionsCacheClearing.value = true

    await fileAPI.clearOptionsCache()

    selectedSeason.value = null
    selectedLesson.value = null
    selectedGrade.value = null
    apiOptions.value = {}

    await getOptions()

    $q.notify({
      type: 'positive',
      message: 'تنظیمات با موفقیت به‌روزرسانی شد.',
      position: 'top'
    })
  } catch (error: any) {
    console.error('Error clearing options cache:', error)

    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || error?.message || 'خطا در به‌روزرسانی تنظیمات',
      position: 'top'
    })
  } finally {
    optionsCacheClearing.value = false
  }
}

onMounted(() => {
  getOptions()
})
</script>
