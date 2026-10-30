<template>
  <div class="browse-explorer-container q-pa-lg">
    <!-- هاله‌های نوری پس‌زمینه (Aurora Glow) -->
    <div class="glow-orb glow-orb--1" />
    <div class="glow-orb glow-orb--2" />

    <!-- کارت شیشه‌ای اصلی اکسپلورر -->
    <div class="glass-explorer-panel">
      <!-- هدر شیشه‌ای بالای فایل منیجر -->
      <div class="explorer-header flex items-center justify-between q-mb-md">
        <div class="flex items-center gap-sm">
          <div class="header-icon-box">
            <q-icon
              name="folder_special"
              size="24px"
              class="text-primary" />
          </div>
          <div>
            <div class="text-h6 text-weight-bolder text-slate-800">
              مدیریت و مرور آرشیو فایل‌ها
            </div>
            <div class="text-caption text-grey-7">
              مرور سلسله‌مراتبی، ویرایش، جابه‌جایی و پیش‌نمایش مدیا
            </div>
          </div>
        </div>

        <div class="flex items-center gap-sm">
          <q-btn
            round
            dense
            flat
            icon="refresh"
            color="primary"
            class="glass-action-btn"
            :loading="loading"
            @click="initTree">
            <q-tooltip>تازه‌سازی ریشه آرشیو</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- وضعیت لودینگ اولیه شیشه‌ای -->
      <div
        v-if="loading"
        class="loading-state-box column flex-center q-pa-xl">
        <div class="quantum-loader-ring">
          <q-spinner-tail
            color="primary"
            size="48px" />
        </div>
        <div class="q-mt-md text-weight-bold text-slate-700">
          در حال کاوش و دریافت ساختار داده‌ها...
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">لطفاً چند لحظه شکیبا باشید</div>
      </div>

      <!-- تنه اصلی درخت با قابلیت کلیک سراسری روی هر ردیف -->
      <div
        v-else
        class="tree-viewport">
        <q-tree
          v-model:expanded="expandedPaths"
          :nodes="treeNodes"
          node-key="path"
          label-key="label"
          children-key="children"
          :selected="selectedPath"
          class="custom-glass-tree"
          @update:selected="onNodeSelected"
          @lazy-load="onLazyLoad">
          <!-- اسلات ادیت اینلاین نام فایل -->
          <template v-slot:default-body="prop">
            <div
              v-if="prop.node.editable"
              class="glass-inline-edit-box q-pa-sm q-mt-xs">
              <q-input
                v-model="prop.node.newLabel"
                :loading="prop.node.loading"
                dense
                outlined
                autofocus
                placeholder="عنوان جدید..."
                class="glass-input-field full-width"
                @keyup.enter="renameItem(prop.node)"
                @keyup.esc="cancelEdit(prop.node)">
                <template v-slot:append>
                  <q-btn
                    round
                    dense
                    flat
                    icon="check"
                    color="positive"
                    :loading="prop.node.loading"
                    @click.stop="renameItem(prop.node)" />
                  <q-btn
                    round
                    dense
                    flat
                    icon="close"
                    color="negative"
                    @click.stop="cancelEdit(prop.node)" />
                </template>
              </q-input>
            </div>
          </template>

          <!-- اسلات هدر هر ردیف نود (کلیک روی کل باکس فعال است) -->
          <template v-slot:default-header="prop">
            <div
              class="tree-node-row"
              :class="{
                'is-directory': prop.node.type === 'directory',
                'is-file': prop.node.type === 'file',
                'is-expanded': isExpanded(prop.node.path),
                'is-selected': selectedPath === prop.node.path
              }"
              @click="handleRowClick(prop.node)">
              <!-- آیکون وضعیت شاخه / فایل با بازتاب نئونی -->
              <div class="node-icon-wrapper flex items-center justify-center">
                <template v-if="prop.node.loading">
                  <q-spinner-dots
                    size="20px"
                    color="primary" />
                </template>
                <template v-else-if="prop.node.type === 'directory'">
                  <q-icon
                    :name="isExpanded(prop.node.path) ? 'folder_open' : 'folder'"
                    size="22px"
                    class="folder-icon" />
                </template>
                <template v-else>
                  <q-icon
                    name="video_file"
                    size="21px"
                    class="file-icon" />
                </template>
              </div>

              <!-- عنوان گره -->
              <div class="node-text-wrapper column justify-center">
                <span class="node-label ellipsis">{{ prop.node.label }}</span>
                <span
                  v-if="prop.node.type === 'file' && prop.node.size"
                  class="node-sub-caption">
                  {{ formatSize(prop.node.size) }}
                </span>
              </div>

              <!-- اکشن‌های مخصوص دایرکتوری -->
              <div
                v-if="prop.node.type === 'directory'"
                class="row-actions flex items-center q-ml-auto">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="cached"
                  color="primary"
                  class="action-icon-btn refresh-btn"
                  :loading="prop.node.loading"
                  @click.stop="refreshDirectory(prop.node)">
                  <q-tooltip class="glass-tooltip">پاک کردن کش پوشه</q-tooltip>
                </q-btn>
                <q-icon
                  :name="isExpanded(prop.node.path) ? 'expand_less' : 'expand_more'"
                  size="20px"
                  class="chevron-indicator" />
              </div>

              <!-- اکشن‌های فایل با استایل شناور و بلور شده -->
              <div
                v-if="prop.node.type === 'file'"
                class="row-actions flex items-center gap-xs q-ml-auto"
                @click.stop>
                <!-- حالت در حال ادیت -->
                <template v-if="prop.node.editable">
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="close"
                    color="negative"
                    class="action-icon-btn"
                    :loading="prop.node.loading"
                    @click.stop="cancelEdit(prop.node)">
                    <q-tooltip class="glass-tooltip">انصراف</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="done"
                    color="positive"
                    class="action-icon-btn"
                    :loading="prop.node.loading"
                    @click.stop="renameItem(prop.node)">
                    <q-tooltip class="glass-tooltip">تأیید</q-tooltip>
                  </q-btn>
                </template>

                <!-- حالت نرمال عملیات فایل -->
                <template v-else>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="delete_outline"
                    color="negative"
                    class="action-icon-btn delete-btn"
                    @click.stop="deleteItem(prop.node)">
                    <q-tooltip class="glass-tooltip">حذف فایل</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="edit_note"
                    color="indigo-7"
                    class="action-icon-btn"
                    @click.stop="onChangeEditable(prop.node)">
                    <q-tooltip class="glass-tooltip">تغییر نام</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="drive_file_move"
                    color="teal-7"
                    class="action-icon-btn"
                    @click.stop="openMoveDialog(prop.node)">
                    <q-tooltip class="glass-tooltip">انتقال فایل</q-tooltip>
                  </q-btn>
                </template>

                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="content_copy"
                  color="purple-7"
                  class="action-icon-btn"
                  @click.stop="copyFileUrl(prop.node.path)">
                  <q-tooltip class="glass-tooltip">کپی لینک دانلود</q-tooltip>
                </q-btn>

                <!-- دکمه ویژه پلی ویدیو -->
                <q-btn
                  unelevated
                  size="sm"
                  round
                  icon="play_arrow"
                  class="play-pill-btn"
                  :loading="prop.node.loading"
                  @click.stop="playVideo(prop.node.path)">
                  <q-tooltip class="glass-tooltip">پخش آنلاین</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
        </q-tree>
      </div>
    </div>

    <!-- دیالوگ پخش کننده ویدیو به سبک Cinema Glass -->
    <q-dialog
      v-model="showVideoDialog"
      maximized
      transition-show="fade"
      transition-hide="fade">
      <div class="cinema-overlay flex flex-center">
        <div class="cinema-card column">
          <div class="cinema-header flex items-center justify-between q-px-lg q-py-sm">
            <div class="flex items-center gap-sm">
              <q-icon
                name="smart_display"
                color="red-5"
                size="22px" />
              <span class="text-subtitle1 text-weight-bold text-white">سینمای اختصاصی ویدیو</span>
            </div>
            <q-btn
              v-close-popup
              dense
              round
              flat
              color="white"
              icon="close"
              class="glass-close-btn" />
          </div>

          <div class="cinema-body col-grow flex flex-center">
            <video
              v-if="currentVideoUrl"
              :src="currentVideoUrl"
              controls
              autoplay
              class="cinema-video">
              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>
          </div>
        </div>
      </div>
    </q-dialog>

    <!-- دیالوگ انتقال فایل با استایل فانتزی و بلور شده -->
    <q-dialog
      v-model="showMoveDialog"
      backdrop-filter="blur(8px)">
      <div class="glass-dialog-card">
        <div class="dialog-header flex items-center justify-between q-pb-md">
          <div class="flex items-center gap-xs">
            <div class="header-dot" />
            <span class="text-h6 text-weight-bolder text-slate-800">تغییر مکان فایل در آرشیو</span>
          </div>
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close"
            color="grey-6" />
        </div>

        <div class="dialog-body q-py-sm">
          <div class="file-target-chip flex items-center no-wrap q-mb-md">
            <q-icon
              name="insert_drive_file"
              size="20px"
              class="q-mr-xs text-primary" />
            <span class="ellipsis text-weight-bold text-slate-700">{{ moveSourceNode?.label }}</span>
          </div>

          <div
            v-if="moveOptionsLoading"
            class="text-center q-pa-lg">
            <q-spinner-dots
              color="primary"
              size="2.5em" />
            <div class="q-mt-sm text-caption text-grey-7">در حال واکشی ساختار مقاصد...</div>
          </div>

          <div
            v-else
            class="move-selectors-box column gap-md">
            <div>
              <label class="select-label">انتخاب فصل</label>
              <q-select
                v-model="moveSeason"
                :options="moveSeasonOptions"
                emit-value
                map-options
                outlined
                dense
                rounded
                class="glass-select"
                placeholder="-- یک فصل انتخاب کنید --"
                @update:model-value="onMoveSeasonChange" />
            </div>

            <div>
              <label class="select-label">انتخاب درس</label>
              <q-select
                v-model="moveLesson"
                :options="moveLessonOptions"
                emit-value
                map-options
                outlined
                dense
                rounded
                class="glass-select"
                :disable="!moveSeason"
                placeholder="-- درس مرتبط --"
                @update:model-value="onMoveLessonChange" />
            </div>

            <div>
              <label class="select-label">انتخاب پایه</label>
              <q-select
                v-model="moveGrade"
                :options="moveGradeOptions"
                emit-value
                map-options
                outlined
                dense
                rounded
                class="glass-select"
                :disable="!moveLesson"
                placeholder="-- پایه تحصیلی --" />
            </div>

            <!-- پیش‌نمایش مسیر مقصد -->
            <transition name="fade">
              <div
                v-if="moveSeason && moveLesson && moveGrade"
                class="destination-preview-banner">
                <span class="preview-title">مسیر هدف جدید:</span>
                <span
                  class="preview-path"
                  dir="ltr">
                  /{{ moveSeason }}/{{ moveLesson }}/{{ moveGrade }}
                </span>
              </div>
            </transition>
          </div>
        </div>

        <div class="dialog-footer flex justify-end gap-sm q-pt-lg">
          <q-btn
            v-close-popup
            flat
            rounded
            label="انصراف"
            color="grey-7"
            class="q-px-md" />
          <q-btn
            unelevated
            rounded
            label="تأیید و انتقال نهایی"
            icon="drive_file_move"
            class="glow-submit-btn q-px-lg"
            :loading="moveSaving"
            :disable="!moveSeason || !moveLesson || !moveGrade || moveOptionsLoading"
            @click="confirmMove" />
        </div>
      </div>
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

// متغیرهای پخش‌کننده
const showVideoDialog = ref(false)
const currentVideoUrl = ref<string | null>(null)

// متغیرهای انتقال فایل
const showMoveDialog = ref(false)
const moveSourceNode = ref<TreeNode | null>(null)
const moveOptionsLoading = ref(false)
const moveSaving = ref(false)
const moveOptions = ref<OptionsType>({})
const moveSeason = ref<string | null>(null)
const moveLesson = ref<string | null>(null)
const moveGrade = ref<string | null>(null)

const BASE_FILE_URL = 'https://dl.asadikia.ir/archive'

function isExpanded (path: string): boolean {
  return expandedPaths.value.includes(path)
}

/**
 * مدیریت کلیک روی ردیف هر نود:
 * دایرکتوری -> باز و بسته شدن (Toggle)
 * فایل -> انتخاب یا پیش‌نمایش
 */
function handleRowClick (node: TreeNode) {
  if (node.type === 'directory') {
    toggleDirectory(node)
  } else {
    selectedPath.value = node.path
  }
}

// کامپیوتدهای انتخاب مسیر مقصد
const moveSeasonOptions = computed(() => {
  const options = moveOptions.value
  if (!options || typeof options !== 'object') return []
  return Object.keys(options).map((season) => ({ label: season, value: season }))
})

const moveLessonOptions = computed(() => {
  if (!moveSeason.value || !moveOptions.value[moveSeason.value]) return []
  return Object.keys(moveOptions.value[moveSeason.value]).map((lesson) => ({
    label: lesson,
    value: lesson
  }))
})

const moveGradeOptions = computed(() => {
  if (!moveSeason.value || !moveLesson.value || !moveOptions.value[moveSeason.value]) return []
  const grades = moveOptions.value[moveSeason.value][moveLesson.value]
  if (!Array.isArray(grades)) return []
  return grades.map((grade) => ({ label: grade, value: grade }))
})

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
    if (typeof options === 'object' && !Array.isArray(options)) {
      moveOptions.value = options as OptionsType
    } else {
      moveOptions.value = {}
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'خطا در دریافت مسیرهای مقصد' })
  } finally {
    moveOptionsLoading.value = false
  }
}

async function confirmMove () {
  if (!moveSourceNode.value || !moveSeason.value || !moveLesson.value || !moveGrade.value) return

  const sourcePath = moveSourceNode.value.path
  const destinationPath = `/${moveSeason.value}/${moveLesson.value}/${moveGrade.value}`

  const sourceDir = '/' + sourcePath.split('/').slice(0, -1).join('/')
  if (sourceDir === destinationPath) {
    $q.notify({ type: 'warning', message: 'فایل در همان پوشه قرار دارد' })
    return
  }

  moveSaving.value = true
  try {
    const res = await fileAPI.move(sourcePath, destinationPath)
    if (res?.ok) {
      removeNodeFromTree(treeNodes.value, sourcePath)
      if (selectedPath.value === sourcePath) selectedPath.value = null
      showMoveDialog.value = false
      $q.notify({ type: 'positive', message: 'فایل با موفقیت منتقل شد' })
    } else {
      $q.notify({ type: 'warning', message: 'انتقال فایل انجام نشد' })
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

function getFullFileUrl (path: string): string {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/')
  return `${BASE_FILE_URL}/${encodedPath}`
}

function copyFileUrl (path: string) {
  const url = getFullFileUrl(path)
  navigator.clipboard
    .writeText(url)
    .then(() => $q.notify({ type: 'positive', message: 'لینک فایل کپی شد' }))
    .catch(() => $q.notify({ type: 'negative', message: 'خطا در کپی لینک' }))
}

function playVideo (path: string) {
  currentVideoUrl.value = getFullFileUrl(path)
  showVideoDialog.value = true
}

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

function formatSize (bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function loadDirectoryChildren (node: TreeNode): Promise<TreeNode[]> {
  if (node.type !== 'directory') return []
  if (node.loaded) return node.children || []
  if (node.loading) return node.children || []

  try {
    node.loading = true
    const response = await fileAPI.browse(node.path)
    const allItems = [...(response.directories || []), ...(response.files || [])]
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
  }
}

function onChangeEditable (node: TreeNode) {
  node.editable = true
  node.newLabel = node.label
}

function cancelEdit (node: TreeNode) {
  node.editable = false
  node.newLabel = null
}

async function renameItem (node: TreeNode) {
  if (!node.newLabel || node.newLabel === node.label) {
    node.editable = false
    return
  }

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

async function deleteItem (node: TreeNode) {
  $q.dialog({
    title: 'تأیید حذف فایل',
    message: `آیا از حذف فایل "${node.label}" اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`,
    cancel: { label: 'انصراف', flat: true, color: 'grey' },
    ok: { label: 'حذف دائمی', unelevated: true, color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      node.loading = true
      const res = await fileAPI.deleteFile(node.path)
      if (res?.ok) {
        removeNodeFromTree(treeNodes.value, node.path)
        if (selectedPath.value === node.path) selectedPath.value = null
        $q.notify({ type: 'positive', message: 'فایل با موفقیت حذف شد' })
      } else {
        $q.notify({ type: 'warning', message: 'حذف فایل انجام نشد' })
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
      if (removeNodeFromTree(node.children, targetPath)) return true
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
      if (replaceNodeChildren(node.children, targetPath, children)) return true
    }
  }
  return false
}

async function refreshDirectory (node: TreeNode) {
  try {
    node.loading = true
    await fileAPI.clearBrowseCache(node.path)
    const response = await fileAPI.browse(node.path)
    const allItems = [...(response.directories || []), ...(response.files || [])]
    const newChildren = mapApiToTreeNodes(allItems)

    node.children = newChildren
    node.loaded = true
    node.lazy = false
    replaceNodeChildren(treeNodes.value, node.path, newChildren)

    $q.notify({ type: 'positive', message: 'کش پوشه به‌روزرسانی شد' })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در تازه‌سازی پوشه',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    node.loading = false
  }
}

function createArchiveRoot (children: TreeNode[] = []): TreeNode {
  return {
    id: '',
    label: 'ریشه آرشیو (Archive)',
    path: '/',
    type: 'directory',
    children,
    lazy: true,
    loaded: true
  }
}

async function toggleDirectory (node: TreeNode) {
  if (node.type !== 'directory') return

  const isExp = expandedPaths.value.includes(node.path)

  if (isExp) {
    expandedPaths.value = expandedPaths.value.filter((p) => p !== node.path)
    return
  }

  try {
    await loadDirectoryChildren(node)
    expandedPaths.value = [...expandedPaths.value, node.path]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'خطا در بارگذاری محتوای پوشه',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function initTree () {
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
}

onMounted(() => {
  initTree()
})
</script>

<style scoped lang="scss">
.browse-explorer-container {
  position: relative;
  min-height: 80vh;
}

/* هاله‌های نوری فضایی */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;

  &--1 {
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.18), transparent 70%);
    top: -40px;
    right: 5%;
  }

  &--2 {
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.14), transparent 70%);
    bottom: 50px;
    left: 8%;
  }
}

/* پنل شیشه‌ای اصلی */
.glass-explorer-panel {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.08),
              0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  padding: 24px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-slate-800 {
  color: #1e293b;
}

.text-slate-700 {
  color: #334155;
}

.glass-action-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* استایل درخت و ردیف‌های شیشه‌ای */
.custom-glass-tree {
  :deep(.q-tree__node-header) {
    padding: 3px 0;
    margin-bottom: 4px;
    border-radius: 16px;
    background: transparent;
    transition: all 0.25s ease;
  }

  :deep(.q-tree__arrow) {
    display: none; // به جای فلش پیش‌فرض از آیکون‌های مدرن اختصاصی استفاده می‌کنیم
  }

  :deep(.q-tree__node--selected .tree-node-row) {
    background: rgba(99, 102, 241, 0.14) !important;
    border-color: rgba(99, 102, 241, 0.35) !important;
  }
}

/* ردیف سفارشی تعاملی کامل */
.tree-node-row {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 14px;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.65);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

  &:hover {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateX(-3px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.08);

    .folder-icon {
      color: #4f46e5;
      transform: scale(1.1);
    }
  }

  &.is-expanded {
    background: rgba(248, 250, 252, 0.85);
    border-color: rgba(148, 163, 184, 0.35);
  }

  .node-icon-wrapper {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.7);
    margin-left: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    flex-shrink: 0;

    .folder-icon {
      color: #f59e0b;
      transition: all 0.25s ease;
    }

    .file-icon {
      color: #0284c7;
    }
  }

  .node-text-wrapper {
    min-width: 0;
    flex-grow: 1;

    .node-label {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }

    .node-sub-caption {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
      margin-top: 1px;
    }
  }

  .chevron-indicator {
    color: #94a3b8;
    margin-right: 4px;
    transition: transform 0.2s ease;
  }
}

/* اکشن‌های شناور */
.row-actions {
  opacity: 0.92;
  transition: opacity 0.2s ease;

  .action-icon-btn {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
    margin: 0 2px;
    transition: all 0.2s ease;

    &:hover {
      background: #ffffff;
      transform: translateY(-2px);
    }
  }

  .play-pill-btn {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    margin-right: 4px;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
      transform: scale(1.08);
    }
  }
}

/* کادر ادیت اینلاین نام فایل */
.glass-inline-edit-box {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px dashed rgba(99, 102, 241, 0.4);
}

/* سینما مدال */
.cinema-overlay {
  background: rgba(10, 15, 29, 0.88);
  backdrop-filter: blur(20px);
  width: 100vw;
  height: 100vh;
}

.cinema-card {
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

.cinema-video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  outline: none;
}

.glass-close-btn {
  background: rgba(255, 255, 255, 0.12);
  &:hover {
    background: rgba(239, 68, 68, 0.6);
  }
}

/* کارت دیالوگ جابجایی */
.glass-dialog-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.2);
  padding: 24px;
  min-width: 440px;
  max-width: 92vw;
}

.header-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
}

.file-target-chip {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(203, 213, 225, 0.6);
  padding: 8px 14px;
  border-radius: 12px;
}

.select-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
}

.destination-preview-banner {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12));
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 14px;
  padding: 10px 14px;

  .preview-title {
    font-size: 11px;
    font-weight: 700;
    color: #4f46e5;
  }

  .preview-path {
    font-size: 13px;
    font-weight: 800;
    color: #1e1b4b;
    margin-top: 2px;
  }
}

.glow-submit-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35);

  &:hover {
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
  }
}
</style>
