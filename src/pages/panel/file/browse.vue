<template>
  <div class="q-pa-md">
    <template v-if="loading">
      <div>در حال گرفتن اطلاعات...</div>
      <q-spinner :thickness="10" />
    </template>
    <q-tree
      v-else
      v-model:expanded="expandedPaths"
      :nodes="treeNodes"
      node-key="path"
      label-key="label"
      children-key="children"
      :selected="selectedPath"
      @update:selected="onNodeSelected"
      @lazy-load="onLazyLoad">
      <!-- اسلات هدر نود -->
      <template v-slot:default-body="prop">
        <q-input
          v-if="prop.node.editable"
          v-model="prop.node.newLabel"
          :loading="prop.node.loading"
          class="full-width"
          label="عنوان جدید" />
      </template>
      <template v-slot:default-header="prop">
        <div class="row items-center full-width">
          <!-- آیکون پوشه/فایل -->
          <q-icon
            :name="prop.node.type === 'directory' ? 'folder' : 'insert_drive_file'"
            :color="prop.node.type === 'directory' ? 'amber' : 'grey-7'"
            size="24px"
            class="q-mr-sm"
            @click.stop="toggleDirectory(prop.node)" />
          <q-btn
            v-if="prop.node.type === 'directory'"
            flat
            dense
            round
            icon="refresh"
            color="primary"
            class="q-ml-sm"
            :loading="prop.node.loading"
            @click.stop="refreshDirectory(prop.node)">
            <q-tooltip>پاک کردن کش این پوشه</q-tooltip>
          </q-btn>

          <div class="text-weight-bold text-body1">
            {{ prop.node.label }}
          </div>

          <!-- دکمه پخش برای فایل‌ها -->
          <div
            v-if="prop.node.type === 'file'"
            class="q-ml-auto">
            <template v-if="prop.node.editable">
              <q-btn
                flat
                dense
                icon="close"
                color="error"
                class="q-ml-auto"
                :loading="prop.node.loading"
                @click.stop="cancelEdit(prop.node)">
                <q-tooltip>انصراف</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="check"
                color="green"
                class="q-ml-auto"
                :loading="prop.node.loading"
                @click.stop="renameItem(prop.node)">
                <q-tooltip>ثبت</q-tooltip>
              </q-btn>
            </template>
            <template v-else>
              <q-btn
                flat
                dense
                icon="delete"
                color="error"
                class="q-ml-auto"
                @click.stop="deleteItem(prop.node)">
                <q-tooltip>حذف</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="edit"
                color="info"
                class="q-ml-auto"
                @click.stop="onChangeEditable(prop.node)">
                <q-tooltip>ویرایش</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                icon="drive_file_move"
                color="teal"
                class="q-ml-auto"
                @click.stop="openMoveDialog(prop.node)">
                <q-tooltip>انتقال فایل</q-tooltip>
              </q-btn>
            </template>
            <q-btn
              flat
              dense
              round
              icon="content_copy"
              color="primary"
              class="q-ml-auto"
              @click.stop="copyFileUrl(prop.node.path)">
              <q-tooltip>کپی لینک فایل</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="play_circle_filled"
              color="primary"
              :loading="prop.node.loading"
              @click.stop="playVideo(prop.node.path)">
              <q-tooltip>پخش فیلم</q-tooltip>
            </q-btn>
          </div>

          <!-- نمایش سایز فایل -->
          <div
            v-if="prop.node.type === 'file'"
            class="q-ml-sm text-caption text-grey">
            {{ formatSize(prop.node.size) }}
          </div>
        </div>
      </template>
    </q-tree>

    <!-- دیالوگ پخش کننده ویدیو -->
    <q-dialog
      v-model="showVideoDialog"
      maximized>
      <q-card class="column full-height">
        <q-bar class="bg-black text-white">
          <q-icon name="movie" />
          <div class="q-ml-sm text-subtitle2">پخش ویدیو</div>
          <q-space />
          <q-btn
            v-close-popup
            dense
            flat
            icon="close">
            <q-tooltip class="bg-white text-black">بستن</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="col-grow bg-black flex flex-center">
          <video
            v-if="currentVideoUrl"
            :src="currentVideoUrl"
            controls
            autoplay
            class="full-width full-height"
            style="max-height: 100%; object-fit: contain">
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
          </video>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- دیالوگ انتقال فایل -->
    <q-dialog v-model="showMoveDialog">
      <q-card
        style="min-width: 450px;
        max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">انتقال فایل</div>
          <q-space />
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-caption text-grey q-mb-md">
            <q-icon
              name="insert_drive_file"
              size="16px"
              class="q-mr-xs" />
            {{ moveSourceNode?.label }}
            <span class="text-grey-6">
              ({{ moveSourceNode?.path }})
            </span>
          </div>

          <div
            v-if="moveOptionsLoading"
            class="text-center q-pa-md">
            <q-spinner
              color="primary"
              size="2em" />
            <div class="q-mt-sm text-grey">در حال دریافت مسیرها...</div>
          </div>

          <template v-else>
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs">انتخاب فصل</div>
              <q-select
                v-model="moveSeason"
                :options="moveSeasonOptions"
                emit-value
                map-options
                options-dense
                outlined
                dense
                class="full-width"
                placeholder="انتخاب فصل"
                @update:model-value="onMoveSeasonChange" />
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs">انتخاب درس</div>
              <q-select
                v-model="moveLesson"
                :options="moveLessonOptions"
                emit-value
                map-options
                options-dense
                outlined
                dense
                class="full-width"
                :disable="!moveSeason"
                placeholder="انتخاب درس"
                @update:model-value="onMoveLessonChange" />
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs">انتخاب پایه</div>
              <q-select
                v-model="moveGrade"
                :options="moveGradeOptions"
                emit-value
                map-options
                options-dense
                outlined
                dense
                class="full-width"
                :disable="!moveLesson"
                placeholder="انتخاب پایه" />
            </div>

            <!-- پیش‌نمایش مسیر مقصد -->
            <q-banner
              v-if="moveSeason && moveLesson && moveGrade"
              dense
              rounded
              class="bg-primary text-white q-mt-sm">
              <div class="text-caption">مسیر مقصد:</div>
              <div
                class="text-body2 text-weight-bold q-mt-xs"
                dir="ltr">
                {{ `/${moveSeason}/${moveLesson}/${moveGrade}` }}
              </div>
            </q-banner>
          </template>
        </q-card-section>

        <q-card-actions
          align="right"
          class="q-pa-md">
          <q-btn
            v-close-popup
            flat
            label="انصراف"
            color="grey" />
          <q-btn
            label="انتقال"
            color="primary"
            icon="drive_file_move"
            :loading="moveSaving"
            :disable="!moveSeason || !moveLesson || !moveGrade || moveOptionsLoading"
            @click="confirmMove" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import FileAPI from 'src/repositories/file'

interface TreeNode {
  id: string;
  label: string;
  path: string;
  type: 'directory' | 'file';
  size?: number;
  children?: TreeNode[];
  lazy?: boolean;
  loaded?: boolean;
  editable?: boolean;
  loading?: boolean;
  newLabel?: string | null;
}

type OptionsType = Record<string, Record<string, string[]>>

const $q = useQuasar()
const fileAPI = new FileAPI()

const treeNodes = ref<TreeNode[]>([])
const loading = ref<boolean>(false)
const selectedPath = ref<string | null>(null)
const expandedPaths = ref<string[]>([])

// متغیرهای مربوط به پخش کننده
const showVideoDialog = ref(false)
const currentVideoUrl = ref<string | null>(null)

// متغیرهای مربوط به انتقال فایل
const showMoveDialog = ref(false)
const moveSourceNode = ref<TreeNode | null>(null)
const moveOptionsLoading = ref(false)
const moveSaving = ref(false)
const moveOptions = ref<OptionsType>({})
const moveSeason = ref<string | null>(null)
const moveLesson = ref<string | null>(null)
const moveGrade = ref<string | null>(null)

// آدرس پایه فایل‌ها (طبق نمونه شما)
const BASE_FILE_URL = 'https://dl.asadikia.ir/archive'

// --- کامپیوتدهای مربوط به انتخاب مسیر مقصد ---

const moveSeasonOptions = computed(() => {
  const options = moveOptions.value

  if (!options || typeof options !== 'object') {
    return []
  }

  return Object.keys(options).map((season) => ({
    label: season,
    value: season
  }))
})

const moveLessonOptions = computed(() => {
  if (
    !moveSeason.value ||
    !moveOptions.value[moveSeason.value]
  ) {
    return []
  }

  return Object.keys(moveOptions.value[moveSeason.value]).map((lesson) => ({
    label: lesson,
    value: lesson
  }))
})

const moveGradeOptions = computed(() => {
  if (
    !moveSeason.value ||
    !moveLesson.value ||
    !moveOptions.value[moveSeason.value]
  ) {
    return []
  }

  const grades = moveOptions.value[moveSeason.value][moveLesson.value]

  if (!Array.isArray(grades)) {
    return []
  }

  return grades.map((grade) => ({
    label: grade,
    value: grade
  }))
})

// --- متدهای انتقال فایل ---

function onMoveSeasonChange () {
  moveLesson.value = null
  moveGrade.value = null
}

function onMoveLessonChange () {
  moveGrade.value = null
}

function openMoveDialog (node: TreeNode) {
  moveSourceNode.value = node
  moveSeason.value = null
  moveLesson.value = null
  moveGrade.value = null
  moveOptions.value = {}

  showMoveDialog.value = true

  loadMoveOptions()
}

async function loadMoveOptions () {
  try {
    moveOptionsLoading.value = true

    const result = await fileAPI.getOptions()

    const options = result?.data ?? result ?? {}

    if (
      typeof options === 'object' &&
      !Array.isArray(options)
    ) {
      moveOptions.value = options as OptionsType
    } else {
      moveOptions.value = {}
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در دریافت مسیرهای مقصد'
    })
  } finally {
    moveOptionsLoading.value = false
  }
}

async function confirmMove () {
  if (
    !moveSourceNode.value ||
    !moveSeason.value ||
    !moveLesson.value ||
    !moveGrade.value
  ) {
    return
  }

  const sourcePath = moveSourceNode.value.path
  const destinationPath = `/${moveSeason.value}/${moveLesson.value}/${moveGrade.value}`

  // اگر مبدأ و مقصد یکی است، خطا بده
  const sourceDir = '/' + sourcePath.split('/').slice(0, -1).join('/')
  if (sourceDir === destinationPath) {
    $q.notify({
      type: 'warning',
      message: 'فایل در همان پوشه قرار دارد'
    })
    return
  }

  moveSaving.value = true

  try {
    const res = await fileAPI.move(sourcePath, destinationPath)

    if (res?.ok) {
      // حذف گره از درخت فعلی
      removeNodeFromTree(treeNodes.value, sourcePath)

      if (selectedPath.value === sourcePath) {
        selectedPath.value = null
      }

      // بستن دیالوگ
      showMoveDialog.value = false

      $q.notify({
        type: 'positive',
        message: 'فایل با موفقیت منتقل شد'
      })
    } else {
      $q.notify({
        type: 'warning',
        message: 'انتقال فایل انجام نشد'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در انتقال فایل',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    moveSaving.value = false
  }
}

// --- ساخت آدرس کامل فایل برای پخش ---

function getFullFileUrl (path: string): string {
  // حذف اسلش اول اگر وجود دارد
  const cleanPath = path.startsWith('/') ? path.substring(1) : path

  // جدا کردن اجزای مسیر و انکد کردن هر بخش به صورت جداگانه
  // این کار باعث می‌شود کاراکترهای فارسی و فاصله درست نمایش داده شوند
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/')

  return `${BASE_FILE_URL}/${encodedPath}`
}

/**
 * کپی آدرس کامل فایل به کلیپ‌بورد
 */
function copyFileUrl (path: string) {
  const url = getFullFileUrl(path)
  navigator.clipboard
    .writeText(url)
    .then(() => {
      $q.notify({ type: 'positive', message: 'لینک فایل کپی شد' })
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'خطا در کپی لینک' })
    })
}

/**
 * تابع باز کردن پخش کننده
 */
function playVideo (path: string) {
  console.log('playVideo path: ', path)
  const url = getFullFileUrl(path)
  console.log('playVideo url: ', url)
  currentVideoUrl.value = url
  showVideoDialog.value = true
}

/**
 * تبدیل آیتم‌های API به نودهای درخت
 */
function mapApiToTreeNodes (items: any[]): TreeNode[] {
  return items.map((item) => {
    const isDirectory = item.type === 'directory'
    return {
      id: item.path,
      label: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      children: isDirectory ? [] : undefined,
      lazy: isDirectory,
      loaded: false
    }
  })
}

function formatSize (bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function loadDirectoryChildren (node: TreeNode): Promise<TreeNode[]> {
  if (node.type !== 'directory') {
    return []
  }

  if (node.loaded) {
    return node.children || []
  }

  if (node.loading) {
    return node.children || []
  }

  try {
    node.loading = true

    const response = await fileAPI.browse(node.path)

    const allItems = [
      ...(response.directories || []),
      ...(response.files || [])
    ]

    const children = mapApiToTreeNodes(allItems)

    node.children = children
    node.loaded = true
    node.lazy = false

    return children
  } finally {
    node.loading = false
  }
}

async function onLazyLoad ({ node, done, fail }: any) {
  try {
    const children = await loadDirectoryChildren(node)
    done(children)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در دریافت لیست فایل‌ها',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })

    fail()
  }
}

function onNodeSelected (key: string | string[] | null) {
  if (typeof key === 'string') {
    selectedPath.value = key
    console.log('Selected path:', key)
  }
}

function onChangeEditable (node: { editable?: boolean; label: string; newLabel: string }) {
  node.editable = true
  node.newLabel = node.label
}

function cancelEdit (node: { editable?: boolean; label: string; newLabel: string }) {
  node.editable = false
  node.newLabel = null
}

async function renameItem (node: {
  editable?: boolean;
  loading?: boolean;
  label: string;
  id: string;
  newLabel: string;
  path: string;
}) {
  try {
    node.loading = true
    const res = await fileAPI.rename(node.path, node.newLabel)
    const newPath: string = res.new_path

    const newLabel = newPath.split('/').pop() || node.newLabel

    node.path = newPath
    node.id = newPath
    node.label = newLabel
    node.newLabel = newLabel

    $q.notify({ type: 'positive', message: 'نام فایل تغییر کرد' })
  } finally {
    node.editable = false
    node.loading = false
  }
}

async function deleteItem (node: {
  editable?: boolean;
  loading?: boolean;
  label: string;
  id: string;
  newLabel: string;
  path: string;
}) {
  $q.dialog({
    title: 'تأیید حذف',
    message: `آیا از حذف "${node.label}" مطمئن هستید؟`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      node.loading = true

      const res = await fileAPI.deleteFile(node.path)

      if (res?.ok) {
        removeNodeFromTree(treeNodes.value, node.path)

        if (selectedPath.value === node.path) {
          selectedPath.value = null
        }

        $q.notify({
          type: 'positive',
          message: 'فایل با موفقیت حذف شد'
        })
      } else {
        $q.notify({
          type: 'warning',
          message: 'حذف فایل انجام نشد'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'خطا در حذف فایل',
        caption: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      node.loading = false
    }
  })
}

function removeNodeFromTree (nodes: TreeNode[], targetPath: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (node.path === targetPath) {
      nodes.splice(i, 1)
      return true
    }

    if (node.children && node.children.length > 0) {
      const removed = removeNodeFromTree(node.children, targetPath)
      if (removed) {
        return true
      }
    }
  }

  return false
}

function replaceNodeChildren (nodes: TreeNode[], targetPath: string, children: TreeNode[]): boolean {
  for (const node of nodes) {
    if (node.path === targetPath) {
      node.children = children
      return true
    }

    if (node.children && node.children.length > 0) {
      const updated = replaceNodeChildren(node.children, targetPath, children)
      if (updated) {
        return true
      }
    }
  }

  return false
}

async function refreshDirectory (node: TreeNode) {
  try {
    node.loading = true

    await fileAPI.clearBrowseCache(node.path)

    const response = await fileAPI.browse(node.path)

    const allItems = [
      ...(response.directories || []),
      ...(response.files || [])
    ]

    const newChildren = mapApiToTreeNodes(allItems)

    node.children = newChildren
    node.loaded = true
    node.lazy = false

    replaceNodeChildren(treeNodes.value, node.path, newChildren)

    $q.notify({
      type: 'positive',
      message: 'کش پوشه پاک و لیست به‌روز شد'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در پاک کردن کش پوشه',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    node.loading = false
  }
}

function createArchiveRoot (children: TreeNode[] = []): TreeNode {
  return {
    id: '',
    label: 'آرشیو',
    path: '/',
    type: 'directory',
    children,
    lazy: true,
    loaded: true
  }
}

async function toggleDirectory (node: TreeNode) {
  if (node.type !== 'directory') {
    return
  }

  const isExpanded = expandedPaths.value.includes(node.path)

  if (isExpanded) {
    expandedPaths.value = expandedPaths.value.filter(
      (path) => path !== node.path
    )

    return
  }

  try {
    await loadDirectoryChildren(node)

    expandedPaths.value = [
      ...expandedPaths.value,
      node.path
    ]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در باز کردن پوشه',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const response = await fileAPI.browse('/')
    const allItems = [...(response.directories || []), ...(response.files || [])]
    treeNodes.value = [createArchiveRoot(mapApiToTreeNodes(allItems))]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در دریافت لیست فایل‌ها',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    loading.value = false
  }
})
</script>
