<template>
  <q-card style="width: 1200px; max-width: 95vw;">
    <q-card-section class="row items-center">
      <div>
        <div class="text-h6">
          مدیریت دسترسی مشاهده فایل‌ها
        </div>
        <div class="text-grey-7">
          {{ sanjadClass.name }}
        </div>
        <div class="row q-gutter-md text-caption text-grey-7 q-mt-xs">
          <div>
            رشته:
            <span class="text-weight-medium text-grey-9">
              {{ sanjadClass.academic_field_name || '-' }}
            </span>
          </div>
          <div>
            پایه:
            <span class="text-weight-medium text-grey-9">
              {{ sanjadClass.academic_level_name || '-' }}
            </span>
          </div>
        </div>
      </div>
      <q-space />
      <q-btn
        v-close-popup
        flat
        round
        icon="close"
        @click="emit('close')" />
    </q-card-section>

    <q-separator />

    <q-card-section v-if="loading">
      <div class="flex flex-center q-pa-xl">
        <q-spinner
          color="primary"
          size="40px" />
      </div>
    </q-card-section>

    <q-card-section v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card
            flat
            bordered
            class="full-height">
            <q-card-section class="bg-grey-2">
              <div class="text-subtitle1 text-weight-bold">
                دسترسی‌های فعال کلاس
              </div>
            </q-card-section>

            <q-separator />

            <q-list
              separator
              class="scroll"
              style="max-height: 65vh">
              <q-item v-if="permissions.length === 0">
                <q-item-section class="text-grey text-center q-pa-md">
                  هیچ دسترسی مشاهده‌ای برای این کلاس ثبت نشده است.
                </q-item-section>
              </q-item>

              <q-item
                v-for="permission in permissions"
                :key="permission.id">
                <q-item-section>
                  <div class="row items-center q-gutter-xs">
                    <q-chip
                      dense
                      color="blue-1"
                      text-color="blue-10"
                      icon="calendar_month">
                      {{ getPermissionParts(permission.name).season }}
                    </q-chip>
                    <q-chip
                      v-if="getPermissionParts(permission.name).lesson"
                      dense
                      color="deep-purple-1"
                      text-color="deep-purple-10"
                      icon="menu_book">
                      {{ getPermissionParts(permission.name).lesson }}
                    </q-chip>
                    <q-chip
                      v-if="getPermissionParts(permission.name).grade"
                      dense
                      color="green-1"
                      text-color="green-10"
                      icon="school">
                      {{ getPermissionParts(permission.name).grade }}
                    </q-chip>
                  </div>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="revokePermission(permission)">
                    <q-tooltip>حذف دسترسی مشاهده</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div class="col-12 col-md-8">
          <q-card
            flat
            bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">
                انتخاب مسیرهای قابل مشاهده
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <q-tree
                :nodes="treeNodes"
                node-key="path"
                label-key="label"
                children-key="children"
                @lazy-load="onLazyLoad">
                <template #default-header="prop">
                  <div class="row items-center full-width">
                    <q-icon
                      name="folder"
                      color="amber"
                      size="24px"
                      class="q-mr-sm" />
                    <div class="text-weight-bold">
                      {{ prop.node.label }}
                    </div>
                    <q-space />
                    <q-btn
                      v-if="prop.node.accessible"
                      round
                      flat
                      dense
                      icon="visibility"
                      :color="hasPermission(prop.node) ? 'positive' : 'grey-5'"
                      :loading="prop.node.loading"
                      @click.stop="togglePermission(prop.node)">
                      <q-tooltip>
                        {{ hasPermission(prop.node) ? 'حذف دسترسی مشاهده' : 'افزودن دسترسی مشاهده' }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-tree>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import FileAPI from 'src/repositories/file'
import SanjadConnectorAPI, {
  type SanjadClassPermissionPayload,
  type SanjadClassType
} from 'src/repositories/sanjadConnector'
import type { PermissionType } from 'src/repositories/permission'

interface TreeNode {
  label: string;
  path: string;
  type: 'directory';
  children?: TreeNode[];
  lazy?: boolean;
  accessible?: boolean;
  loading?: boolean;
}

const props = defineProps<{
  sanjadClass: SanjadClassType;
}>()

const emit = defineEmits<{
  close: [];
}>()

const $q = useQuasar()
const fileAPI = new FileAPI()
const sanjadConnectorAPI = new SanjadConnectorAPI()
const loading = ref(false)
const permissions = ref<PermissionType[]>([])
const treeNodes = ref<TreeNode[]>([])

function cleanPath (path: string): string {
  return path.replace(/^\/+|\/+$/g, '')
}

function getPathSegments (path: string): string[] {
  const normalizedPath = cleanPath(path)
  return normalizedPath ? normalizedPath.split('/').filter(Boolean) : []
}

function getPermissionName (path: string): string {
  return ['read', ...getPathSegments(path)].join('#')
}

function hasPermission (node: TreeNode): boolean {
  return permissions.value.some((permission) => permission.name === getPermissionName(node.path))
}

function mapApiToTreeNodes (items: any[]): TreeNode[] {
  return items
    .filter((item) => item.type === 'directory')
    .map((item) => {
      const segments = getPathSegments(item.path)

      return {
        label: item.name,
        path: item.path,
        type: 'directory',
        children: [],
        lazy: true,
        accessible: segments.length >= 1 && segments.length <= 3,
        loading: false
      }
    })
}

async function loadDirectory (path: string): Promise<TreeNode[]> {
  const response = await fileAPI.browse(path)
  return mapApiToTreeNodes(response.directories || [])
}

async function onLazyLoad ({ node, done, fail }: any) {
  try {
    done(await loadDirectory(node.path))
  } catch (error) {
    fail()
    notifyError('خطا در دریافت پوشه‌ها', error)
  }
}

function createPayload (path: string): SanjadClassPermissionPayload | null {
  const segments = getPathSegments(path)

  if (segments.length < 1 || segments.length > 3) {
    return null
  }

  return {
    action: 'read',
    season: segments[0],
    lesson: segments[1] ?? null,
    grade: segments[2] ?? null
  }
}

async function togglePermission (node: TreeNode) {
  const classId = props.sanjadClass.id
  const payload = createPayload(node.path)

  if (!classId || !payload) {
    return
  }

  node.loading = true

  try {
    if (hasPermission(node)) {
      await sanjadConnectorAPI.revokeClassPermission(classId, payload)
      permissions.value = permissions.value.filter(
        (permission) => permission.name !== getPermissionName(node.path)
      )
      $q.notify({ type: 'positive', message: 'دسترسی مشاهده حذف شد' })
    } else {
      const response = await sanjadConnectorAPI.grantClassPermission(classId, payload)
      permissions.value.push(response.permission)
      $q.notify({ type: 'positive', message: 'دسترسی مشاهده اضافه شد' })
    }
  } catch (error) {
    notifyError('عملیات دسترسی انجام نشد', error)
  } finally {
    node.loading = false
  }
}

async function revokePermission (permission: PermissionType) {
  const classId = props.sanjadClass.id
  const [, season, lesson, grade] = permission.name.split('#')

  if (!classId || !season) {
    return
  }

  try {
    await sanjadConnectorAPI.revokeClassPermission(classId, {
      action: 'read',
      season,
      lesson: lesson || null,
      grade: grade || null
    })
    permissions.value = permissions.value.filter((item) => item.id !== permission.id)
    $q.notify({ type: 'positive', message: 'دسترسی مشاهده حذف شد' })
  } catch (error) {
    notifyError('خطا در حذف دسترسی', error)
  }
}

function getPermissionParts (name: string) {
  const [, season, lesson, grade] = name.split('#')
  return { season, lesson, grade }
}

function notifyError (message: string, error: unknown) {
  $q.notify({
    type: 'negative',
    message,
    caption: error instanceof Error ? error.message : 'خطای نامشخص'
  })
}

async function loadData () {
  const classId = props.sanjadClass.id

  if (!classId) {
    return
  }

  loading.value = true

  try {
    const [permissionsResponse, rootChildren] = await Promise.all([
      sanjadConnectorAPI.getClassPermissions(classId),
      loadDirectory('/')
    ])

    permissions.value = permissionsResponse.permissions
    treeNodes.value = [
      {
        label: 'آرشیو',
        path: '/',
        type: 'directory',
        children: rootChildren,
        lazy: true,
        accessible: false
      }
    ]
  } catch (error) {
    notifyError('خطا در دریافت اطلاعات دسترسی کلاس', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.sanjadClass.id, loadData, { immediate: true })
</script>
