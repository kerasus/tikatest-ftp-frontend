<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          مدیریت دسترسی‌های دبیر
        </div>

        <div
          v-if="user"
          class="text-grey-7 q-mt-sm">
          {{ user.firstname }} {{ user.lastname }}
          -
          {{ user.username }}
        </div>
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

          <!-- لیست دسترسی‌ها (سمت راست) -->
          <div class="col-12 col-md-4">
            <q-card
              flat
              bordered
              class="full-height">
              <q-card-section class="bg-grey-2">
                <div class="text-subtitle1 text-weight-bold">
                  دسترسی‌های فعال کاربر
                </div>
              </q-card-section>

              <q-separator />

              <q-list
                separator
                class="scroll"
                style="max-height: 70vh">
                <q-item v-if="permissions.length === 0">
                  <q-item-section class="text-grey text-center q-pa-md">
                    هیچ دسترسی اختصاصی برای این کاربر ثبت نشده است.
                  </q-item-section>
                </q-item>

                <q-item
                  v-for="permission in permissions"
                  :key="permission.id"
                  class="q-py-sm">
                  <q-item-section>
                    <div class="row items-center q-gutter-xs">
                      <!-- نمایش اکشن با چیپ رنگی -->
                      <q-chip
                        dense
                        text-color="white"
                        :color="getActionColor(permission.name)"
                        :icon="getActionIcon(permission.name)"
                        size="sm">
                        {{ getActionLabel(permission.name) }}
                      </q-chip>

                      <!-- نمایش مسیر به صورت خوانا -->
                      <div class="row items-center q-gutter-xs">
                        <q-chip
                          v-if="getPermissionParts(permission.name).season"
                          dense
                          square
                          color="blue-1"
                          text-color="blue-10"
                          icon="calendar_month">
                          {{ getPermissionParts(permission.name).season }}
                        </q-chip>

                        <q-chip
                          v-if="getPermissionParts(permission.name).grade"
                          dense
                          square
                          color="green-1"
                          text-color="green-10"
                          icon="school">
                          پایه {{ getPermissionParts(permission.name).grade }}
                        </q-chip>

                        <q-chip
                          v-if="getPermissionParts(permission.name).lesson"
                          dense
                          square
                          color="deep-purple-1"
                          text-color="deep-purple-10"
                          icon="menu_book">
                          {{ getPermissionParts(permission.name).lesson }}
                        </q-chip>
                      </div>

                    </div>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="revokeByPermissionObject(permission)">
                      <q-tooltip>حذف این دسترسی</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

          <!-- درخت -->
          <div class="col-12 col-md-8">

            <q-card
              flat
              bordered>

              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">
                  انتخاب مسیرها
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

                      <template v-if="prop.node.accessible">

                        <q-btn
                          v-for="action in actions"
                          :key="action.value"
                          round
                          flat
                          dense
                          size="sm"
                          :icon="action.icon"
                          :color="hasPermission(prop.node, action.value) ? 'positive' : 'grey-5'"
                          :loading="prop.node.loadingAction === action.value"
                          @click.stop="togglePermission(prop.node, action.value)">

                          <q-tooltip>
                            {{ action.label }}
                          </q-tooltip>

                        </q-btn>

                      </template>

                    </div>
                  </template>

                </q-tree>

              </q-card-section>

            </q-card>

          </div>

        </div>
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

import FileAPI from 'src/repositories/file'
import UserPermissionAPI from 'src/repositories/userPermission'
import type {
  UserPermissionPayload
} from 'src/repositories/userPermission'
import type {
  PermissionActionType,
  PermissionType
} from 'src/repositories/permission'

interface UserInfo {
  id: number;
  firstname: string | null;
  lastname: string | null;
  username: string;
}

interface TreeNode {
  label: string;
  path: string;
  type: 'directory';
  children?: TreeNode[];
  lazy?: boolean;
  accessible?: boolean;
  loadingAction?: PermissionActionType | null;
}

const route = useRoute()
const $q = useQuasar()

const fileAPI = new FileAPI()

const userId = computed(() => Number(route.params.id))
const userPermissionAPI = new UserPermissionAPI(userId.value)

const loading = ref(false)
const user = ref<UserInfo | null>(null)
const permissions = ref<PermissionType[]>([])
const treeNodes = ref<TreeNode[]>([])

const actions: {
  value: PermissionActionType;
  label: string;
  icon: string;
}[] = [
  {
    value: 'read',
    label: 'خواندن',
    icon: 'visibility'
  },
  {
    value: 'write',
    label: 'نوشتن',
    icon: 'edit'
  },
  {
    value: 'rename', // اکشن جدید
    label: 'تغییر نام',
    icon: 'drive_file_rename_outline'
  },
  {
    value: 'move',
    label: 'انتقال',
    icon: 'drive_file_move'
  },
  {
    value: 'delete',
    label: 'حذف',
    icon: 'delete'
  }
]

function cleanPath (path: string): string {
  return path.replace(/^\/+|\/+$/g, '')
}

function getPathSegments (path: string): string[] {
  const normalizedPath = cleanPath(path)

  if (!normalizedPath) {
    return []
  }

  return normalizedPath.split('/').filter(Boolean)
}

function getPermissionName (
  action: PermissionActionType,
  path: string
): string {
  const segments = getPathSegments(path)

  return [action, ...segments].join('#')
}

function hasPermission (
  node: TreeNode,
  action: PermissionActionType
): boolean {
  const permissionName = getPermissionName(action, node.path)

  return permissions.value.some(
    (permission) => permission.name === permissionName
  )
}

function mapApiToTreeNodes (items: any[]): TreeNode[] {
  return items
    .filter((item) => item.type === 'directory')
    .map((item) => {
      const path = item.path
      const segments = getPathSegments(path)

      return {
        label: item.name,
        path,
        type: 'directory',
        children: [],
        lazy: true,

        // ساخت permission در این سیستم حداکثر سه بخش دارد:
        // season / lesson / grade
        accessible: segments.length >= 1 && segments.length <= 3
      }
    })
}

async function loadDirectory (path: string): Promise<TreeNode[]> {
  const response = await fileAPI.browse(path)

  return mapApiToTreeNodes([
    ...(response.directories || []),
    ...(response.files || [])
  ])
}

async function onLazyLoad ({ node, done, fail }: any) {
  try {
    const children = await loadDirectory(node.path)
    done(children)
  } catch (error) {
    fail()
    $q.notify({
      type: 'negative',
      message: 'خطا در دریافت پوشه‌ها',
      caption: error instanceof Error ? error.message : 'خطای نامشخص'
    })
  }
}

async function togglePermission (
  node: TreeNode,
  action: PermissionActionType
) {
  const payload = createPayload(node.path, action)

  if (!payload) {
    return
  }

  node.loadingAction = action

  try {
    if (hasPermission(node, action)) {
      await userPermissionAPI.revoke(payload)

      permissions.value = permissions.value.filter(
        (permission) => permission.name !== getPermissionName(action, node.path)
      )

      $q.notify({
        type: 'positive',
        message: 'دسترسی حذف شد'
      })
    } else {
      const response = await userPermissionAPI.grant(payload)

      const permission = response.permission as PermissionType

      if (!permissions.value.some((item) => item.name === permission.name)) {
        permissions.value.push(permission)
      }

      $q.notify({
        type: 'positive',
        message: 'دسترسی اضافه شد'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'عملیات دسترسی انجام نشد',
      caption: error instanceof Error ? error.message : 'خطای نامشخص'
    })
  } finally {
    node.loadingAction = null
  }
}

function createPayload (
  path: string,
  action: PermissionActionType
): UserPermissionPayload | null {
  const segments = getPathSegments(path)

  if (segments.length < 1 || segments.length > 3) {
    return null
  }

  return {
    action,
    season: segments[0],
    lesson: segments[1] ?? null,
    grade: segments[2] ?? null
  }
}

async function loadData () {
  loading.value = true

  try {
    const [permissionsResponse, rootChildren] = await Promise.all([
      userPermissionAPI.getAll(),
      loadDirectory('/')
    ])

    user.value = permissionsResponse.user
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
    $q.notify({
      type: 'negative',
      message: 'خطا در دریافت اطلاعات دسترسی',
      caption: error instanceof Error ? error.message : 'خطای نامشخص'
    })
  } finally {
    loading.value = false
  }
}

// توابع کمکی برای نمایش زیباتر پرمیشن‌ها
function parsePermissionName (name: string) {
  const [action, ...parts] = name.split('#')
  return {
    action: action as PermissionActionType,
    path: parts.join(' / ')
  }
}

function getActionLabel (name: string): string {
  const { action } = parsePermissionName(name)
  const found = actions.find((a) => a.value === action)
  return found ? found.label : action
}

function getActionIcon (name: string): string {
  const { action } = parsePermissionName(name)
  const found = actions.find((a) => a.value === action)
  return found ? found.icon : 'help'
}

function getActionColor (name: string): string {
  const { action } = parsePermissionName(name)
  switch (action) {
    case 'read': return 'blue-7'
    case 'write': return 'orange-8'
    case 'delete': return 'red-8'
    case 'rename': return 'cyan-8'
    case 'move': return 'deep-purple-7'
    default: return 'grey-7'
  }
}

function formatPermissionPath (name: string): string {
  const { path } = parsePermissionName(name)
  return path || 'تمامی مسیرها'
}

// متد حذف مستقیم از لیست سمت راست
async function revokeByPermissionObject (permission: PermissionType) {
  const segments = permission.name.split('#')
  const action = segments[0] as PermissionActionType

  // شبیه‌سازی ساختار برای API
  const payload: UserPermissionPayload = {
    action,
    season: segments[1] || '',
    lesson: segments[2] || null,
    grade: segments[3] || null
  }

  $q.dialog({
    title: 'تایید حذف',
    message: `آیا از حذف دسترسی "${getActionLabel(permission.name)}" برای مسیر "${formatPermissionPath(permission.name)}" مطمئن هستید؟`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await userPermissionAPI.revoke(payload)
      permissions.value = permissions.value.filter((p) => p.id !== permission.id)
      $q.notify({ type: 'positive', message: 'دسترسی با موفقیت حذف شد' })
    } catch (error) {
      $q.notify({ type: 'negative', message: 'خطا در حذف دسترسی' })
    }
  })
}

interface PermissionParts {
  action: PermissionActionType;
  season: string | null;
  lesson: string | null;
  grade: string | null;
}

function getPermissionParts (name: string): PermissionParts {
  const [action, season, lesson, grade] = name.split('#')

  return {
    action: action as PermissionActionType,
    season: season || null,
    lesson: lesson || null,
    grade: grade || null
  }
}

onMounted(loadData)
</script>
