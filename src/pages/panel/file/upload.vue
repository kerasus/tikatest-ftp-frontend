<template>
  <q-card
    flat
    class="glass-card full-width">
    <!-- هدر فانتزی -->
    <div class="row items-center justify-between q-mb-lg header-section">
      <div class="row items-center q-gutter-x-sm">
        <div class="icon-avatar shadow-3">
          <q-icon
            name="cloud_upload"
            size="30px"
            color="white" />
        </div>
        <div>
          <div class="text-h6 text-weight-bolder text-primary">آپلودر مدیا</div>
          <div class="text-caption text-grey-6">آپلود چانک‌بندی‌شده همراه با کش لحظه‌ای</div>
        </div>
      </div>

      <q-btn
        unelevated
        rounded
        color="primary"
        outline
        icon="auto_awesome"
        label="تازه‌سازی تنظیمات"
        :loading="optionsCacheClearing"
        :disable="optionsLoading || uploading"
        class="q-px-md refresh-chip"
        @click="refreshOptionsCache">
        <q-tooltip class="bg-dark text-body2">پاکسازی کش و سینک مجدد لیست‌ها</q-tooltip>
      </q-btn>
    </div>

    <!-- ناحیه درگ اند دراپ فوق فانتزی -->
    <div
      v-if="!selectedFile"
      class="dropzone-box text-center q-pa-xl q-mb-lg cursor-pointer"
      :class="{ 'dropzone-active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInputRef?.pickFiles()">
      <q-file
        ref="fileInputRef"
        v-model="selectedFile"
        accept="video/*"
        class="hidden"
        @update:model-value="handleFileSelect" />

      <div class="floating-icon q-mb-md">
        <q-avatar
          size="84px"
          font-size="44px"
          color="blue-1"
          text-color="primary"
          class="shadow-10">
          <q-icon name="movie" />
        </q-avatar>
      </div>

      <div class="text-h6 text-weight-bold text-grey-8 q-mb-xs">
        ویدیو خودت رو اینجا رها کن یا کلیک کن!
      </div>
      <div class="text-caption text-grey-5">
        پشتیبانی از انواع فرمت‌های ویدیویی (MP4, MKV, MOV) با آپلود قطعه‌قطعه
      </div>
    </div>

    <!-- مشخصات و پیش‌نمایش در صورت انتخاب فایل -->
    <transition
      appear
      enter-active-class="animated fadeInDown">
      <div
        v-if="selectedFile"
        class="row q-col-gutter-lg q-mb-lg items-center">
        <!-- پیش‌نمایش ویدیو -->
        <div
          v-if="previewUrl"
          class="col-12 col-md-6">
          <div class="video-preview-wrapper shadow-6">
            <video
              :src="previewUrl"
              controls
              class="custom-video" />
            <div class="video-badge">
              <q-icon
                name="hd"
                size="18px"
                class="q-mr-xs" />
              آماده پردازش
            </div>
          </div>
        </div>

        <!-- کارت اطلاعات فایل -->
        <div :class="previewUrl ? 'col-12 col-md-6' : 'col-12'">
          <q-card
            flat
            bordered
            class="file-meta-card q-pa-md">
            <div class="row justify-between items-center q-mb-sm">
              <div class="text-subtitle1 text-weight-bold text-grey-8 flex items-center">
                <q-icon
                  name="videocam"
                  color="primary"
                  size="22px"
                  class="q-mr-xs" />
                شناسنامه ویدیو
              </div>
              <q-btn
                round
                dense
                flat
                color="negative"
                icon="close"
                :disable="uploading"
                @click="removeFile">
                <q-tooltip>حذف و انتخاب فایل دیگر</q-tooltip>
              </q-btn>
            </div>

            <div class="meta-row">
              <span class="meta-label">نام فایل:</span>
              <span
                class="meta-val text-weight-bold ellipsis"
                style="max-width: 200px;">{{ selectedFile.name }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">حجم فایل:</span>
              <span class="meta-val text-primary text-weight-bold">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">فرمت / پسوند:</span>
              <span class="meta-val">{{ selectedFile.type || 'ویدیو ناشناخته' }}</span>
            </div>
            <div
              v-if="selectedFile.size > 0"
              class="meta-row">
              <span class="meta-label">تعداد چانک‌های تخمینی:</span>
              <span class="meta-val text-secondary text-weight-bold">{{ Math.ceil(selectedFile.size / CHUNK_SIZE) }} تکه</span>
            </div>
          </q-card>
        </div>
      </div>
    </transition>

    <!-- پنل تنظیمات دسته‌بندی با استایل کپسولی و شیک -->
    <div class="category-panel q-pa-md q-mb-lg">
      <div class="text-subtitle2 text-grey-7 q-mb-md flex items-center">
        <q-icon
          name="tune"
          color="primary"
          class="q-mr-xs" />
        تنظیمات مقصد و دسته‌بندی محتوا
      </div>

      <div
        v-if="optionsLoading"
        class="row justify-center items-center q-py-lg">
        <q-spinner-dots
          color="primary"
          size="40px" />
        <span class="q-ml-sm text-grey-7">در حال واکشی تنظیمات از سرور...</span>
      </div>

      <div
        v-else
        class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedSeason"
            :options="seasonOptions"
            emit-value
            map-options
            options-dense
            rounded
            outlined
            label="۱. فصل را برگزینید"
            bg-color="white"
            transition-show="jump-down"
            transition-hide="jump-up"
            @update:model-value="onSeasonChange">
            <template v-slot:prepend>
              <q-icon
                name="filter_drama"
                color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedLesson"
            :options="lessonOptions"
            emit-value
            map-options
            options-dense
            rounded
            outlined
            label="۲. درس مورد نظر"
            bg-color="white"
            :disable="!selectedSeason"
            transition-show="jump-down"
            transition-hide="jump-up"
            @update:model-value="onLessonChange">
            <template v-slot:prepend>
              <q-icon
                name="menu_book"
                color="primary" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedGrade"
            :options="gradeOptions"
            emit-value
            map-options
            options-dense
            rounded
            outlined
            label="۳. پایه تحصیلی"
            bg-color="white"
            :disable="!selectedLesson"
            transition-show="jump-down"
            transition-hide="jump-up">
            <template v-slot:prepend>
              <q-icon
                name="school"
                color="primary" />
            </template>
          </q-select>
        </div>
      </div>
    </div>

    <!-- وضعیت زنده آپلود با انیمیشن و رادار -->
    <transition
      appear
      enter-active-class="animated fadeInUp">
      <div
        v-if="uploading"
        class="upload-progress-container q-pa-md q-mb-lg">
        <div class="row justify-between items-center q-mb-xs">
          <div class="row items-center">
            <q-spinner-orbit
              color="primary"
              size="24px"
              class="q-mr-sm" />
            <span class="text-weight-bold text-grey-9">در حال ارسال پکت‌ها به سرور...</span>
          </div>
          <span class="text-h6 text-weight-bolder text-primary">{{ uploadPercentage }}%</span>
        </div>

        <q-linear-progress
          rounded
          size="14px"
          :value="uploadProgress"
          color="primary"
          class="glow-progress q-my-sm" />

        <div class="row justify-between text-caption text-grey-7 q-mt-xs">
          <span>{{ formatFileSize(uploadedBytes) }} از {{ formatFileSize(totalSize) }}</span>
          <span class="text-weight-medium">قطعه {{ currentChunkIndex + 1 }} از {{ totalChunks }}</span>
        </div>
      </div>
    </transition>

    <!-- اکشن‌ها -->
    <div class="actions-wrapper">
      <q-btn
        v-if="!uploading"
        unelevated
        rounded
        color="primary"
        size="lg"
        label="پرتاب و آپلود نهایی"
        icon="rocket_launch"
        :disable="!canUpload"
        class="full-width upload-submit-btn shadow-5"
        @click="handleUpload">
        <q-tooltip
          v-if="!canUpload"
          class="bg-red-8">
          لطفاً فایل و تمام گزینه‌های دسته‌بندی را کامل کنید
        </q-tooltip>
      </q-btn>

      <q-btn
        v-else
        unelevated
        rounded
        color="negative"
        size="lg"
        label="لغو فوری عملیات"
        icon="highlight_off"
        class="full-width shadow-4"
        @click="cancelUpload" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import FileAPI from 'src/repositories/file'
import { onMounted, ref, computed } from 'vue'

const CHUNK_SIZE = 1 * 1024 * 1024 // 1 MB

const $q = useQuasar()
const fileAPI = new FileAPI()

const fileInputRef = ref<any>(null)
const isDragging = ref(false)
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

// وضعیت آماده بودن برای ارسال
const canUpload = computed(() => {
  return !!(selectedFile.value && selectedSeason.value && selectedLesson.value && selectedGrade.value)
})

// لیست گزینه‌ها
const seasonOptions = computed(() => {
  const options = apiOptions.value
  if (!options || typeof options !== 'object') return []
  return Object.keys(options).map((season) => ({ label: season, value: season }))
})

const lessonOptions = computed(() => {
  if (!selectedSeason.value || !apiOptions.value[selectedSeason.value]) return []
  const lessons = apiOptions.value[selectedSeason.value]
  return Object.keys(lessons).map((lesson) => ({ label: lesson, value: lesson }))
})

const gradeOptions = computed(() => {
  if (!selectedSeason.value || !selectedLesson.value || !apiOptions.value[selectedSeason.value]) return []
  const grades = apiOptions.value[selectedSeason.value][selectedLesson.value]
  return grades.map((grade) => ({ label: grade, value: grade }))
})

const onSeasonChange = () => {
  selectedLesson.value = null
  selectedGrade.value = null
}

const onLessonChange = () => {
  selectedGrade.value = null
}

const handleFileSelect = (file: File | null) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = file
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    handleFileSelect(droppedFiles[0])
  }
}

const removeFile = () => {
  handleFileSelect(null)
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
    if (typeof options === 'object' && !Array.isArray(options)) {
      apiOptions.value = options as OptionsType
    } else {
      apiOptions.value = {}
    }
  } catch (error) {
    console.error('Error fetching options:', error)
    apiOptions.value = {}
    $q.notify({
      type: 'negative',
      message: 'خطا در واکشی اطلاعات پیکربندی از سرور'
    })
  } finally {
    optionsLoading.value = false
  }
}

const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

async function cancelUpload () {
  if (abortController) {
    abortController.abort()
    try {
      if (currentUploadId.value) {
        await fileAPI.cancel(currentUploadId.value)
      }
    } catch {
      console.warn('Cancel request failed or already stopped.')
    }

    uploading.value = false
    $q.notify({
      type: 'warning',
      message: 'فرآیند انتقال با دستور شما متوقف شد.',
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
      if (signal.aborted) throw error
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
      }
    }
  }
  throw lastError
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  abortController = new AbortController()
  const signal = abortController.signal

  const season = selectedSeason.value || ''
  const lesson = selectedLesson.value || ''
  const grade = selectedGrade.value || ''

  const file = selectedFile.value
  totalSize.value = file.size
  uploadedBytes.value = 0
  const chunksCount = Math.ceil(totalSize.value / CHUNK_SIZE)

  uploading.value = true
  uploadProgress.value = 0
  uploadPercentage.value = 0
  totalChunks.value = chunksCount
  currentChunkIndex.value = 0
  currentUploadId.value = generateUploadId()

  try {
    for (let i = 0; i < chunksCount; i++) {
      currentChunkIndex.value = i

      if (signal.aborted) {
        throw new Error('Upload cancelled by user')
      }

      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, totalSize.value)
      const chunkBlob = file.slice(start, end)

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

      const response = await uploadChunkWithRetry(formData, signal, 3)

      if (!response || typeof response !== 'object') {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد.')
      }

      uploadedBytes.value += chunkBlob.size
      uploadProgress.value = uploadedBytes.value / totalSize.value
      uploadPercentage.value = Math.round(uploadProgress.value * 100)

      if (response.complete) {
        $q.notify({
          type: 'positive',
          message: `عملیات موفق! فایل ${response.file_info?.filename || file.name} در سرور جاخوش کرد 🎉`,
          position: 'top',
          closeBtn: true,
          timeout: 4000
        })
        break
      }
    }
  } catch (error: any) {
    if (error.message !== 'Upload cancelled by user') {
      $q.notify({
        type: 'negative',
        message: `خطا در انتقال قطعه ${currentChunkIndex.value + 1}: ${error.message || 'مشکل ناشناخته'}`,
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
      message: 'پیکربندی با موفقیت نو نوار شد ✨',
      position: 'top'
    })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || error?.message || 'خطا در رفرش کش تنظیمات',
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

<style scoped lang="scss">
/* کارت شیشه‌ای اصلی */
.glass-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  padding: 32px;
}

/* آیکون هدر */
.icon-avatar {
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* دکمه رفرش نئومورفیک */
.refresh-chip {
  transition: all 0.25s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.2);
  }
}

/* دراپ‌زون جادویی */
.dropzone-box {
  border: 2.5px dashed #c7d2fe;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.65);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover,
  &.dropzone-active {
    border-color: #4f46e5;
    background: rgba(238, 242, 255, 0.85);
    transform: scale(1.01);
  }
}

.floating-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* پیش‌نمایش ویدیو */
.video-preview-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #0f172a;
  border: 2px solid #e2e8f0;

  .custom-video {
    width: 100%;
    max-height: 260px;
    display: block;
    object-fit: cover;
  }

  .video-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(6px);
    color: #fff;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    display: flex;
    align-items: center;
  }
}

/* کارت اطلاعات فایل */
.file-meta-card {
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;

  .meta-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }

    .meta-label {
      color: #64748b;
    }
  }
}

/* پنل دسته‌بندی */
.category-panel {
  background: rgba(241, 245, 249, 0.6);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
}

/* لودینگ و پروگرس */
.upload-progress-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.glow-progress {
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.35);
}

/* دکمه نهایی پرواز */
.upload-submit-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -6px rgba(79, 70, 229, 0.5) !important;
  }
}
</style>
