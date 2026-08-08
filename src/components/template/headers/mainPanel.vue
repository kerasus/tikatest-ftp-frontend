<script setup lang="ts">
import { useQuasar } from 'quasar'
import moment from 'jalali-moment'
import { useRouter } from 'vue-router'
import { useUser } from 'src/stores/user'
import { useAppLayout } from 'stores/appLayout'
import { ref, onMounted, onUnmounted } from 'vue'
import { userRoleOptions } from 'src/repositories/user'
import { useHeaderBreadCrumbs } from 'src/stores/headerBreadCrumbs'

withDefaults(defineProps<{ floated?: boolean }>(), {
  floated: false
})

const $q = useQuasar()
const router = useRouter()
const userManager = useUser()
const appLayoutStore = useAppLayout()
const headerBreadCrumbsStore = useHeaderBreadCrumbs()
const formattedDate = ref('')
const formattedTime = ref('')


function updateDateTime () {
  const now = moment()
  formattedDate.value = now.format('jYYYY/jMM/jDD')
  formattedTime.value = now.format('HH:mm')
}

function translateRole (roleName: string): string {
  const target = userRoleOptions.find((role) => role.value === roleName)
  if (!target) {
    return '-'
  }

  return target.label
}

let timer: any
onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function toggleLeftDrawerMini () {
  appLayoutStore.layoutLeftDrawerMiniToOverlay = $q.screen.lt.md
  appLayoutStore.layoutLeftDrawerMini = !appLayoutStore.layoutLeftDrawerMini
}

function toggleLeftDrawerVisible () {
  appLayoutStore.layoutLeftDrawerMiniToOverlay = false
  appLayoutStore.layoutLeftDrawerVisible = !appLayoutStore.layoutLeftDrawerVisible
}

function logout () {
  userManager.logout()
  router.push({ name: 'Auth.Login' })
}

function goToProfileEdit () {
  const userId = userManager.me?.id

  if (!userId) {
    $q.notify({
      type: 'negative',
      message: 'شناسه کاربر یافت نشد'
    })
    return
  }

  router.push({
    name: 'Panel.User.Edit',
    params: {
      id: userId
    }
  })
}

</script>

<template>
  <div
    class="main-dashboard-wrapper"
    :class="{ floated: floated }">
    <q-toolbar class="main-dashboard">
      <q-toolbar-title class="main-dashboard__main-section">
        <div class="main-dashboard__right-section">
          <div class="toggle-mini-btn">
            <q-btn
              class="icon-button drawer-btn gt-sm"
              color="primary"
              flat
              :icon="
                appLayoutStore.layoutLeftDrawerMini
                  ? 'keyboard_double_arrow_left'
                  : 'keyboard_double_arrow_right'
              "
              @click="toggleLeftDrawerMini" />
            <q-btn
              class="icon-button drawer-btn lt-md"
              color="primary"
              flat
              icon="menu"
              @click="toggleLeftDrawerVisible" />
          </div>
          <div class="breadCrumbs">
            <q-breadcrumbs active-color="color-text2">
              <q-breadcrumbs-el
                v-for="(breadCrumb, breadCrumbIndex) in headerBreadCrumbsStore.breadCrumbs"
                :key="breadCrumbIndex"
                :to="breadCrumb.to ? breadCrumb.to : undefined">
                {{ (breadCrumb.label) }}
              </q-breadcrumbs-el>
            </q-breadcrumbs>
          </div>
          <div class="pageCategory">
            {{ (headerBreadCrumbsStore.pageCategory) }}
          </div>
        </div>
        <div class="main-dashboard__center-section" />
        <div class="main-dashboard__left-section">
          <div class="time">
            {{ formattedDate }}
            <q-icon name="remove" />
            {{ formattedTime }}
          </div>
          <!-- <q-btn icon="notifications" class="icon-button" @click="toggleRightDrawer">
            <q-badge floating rounded color="red"> 2 </q-badge>
          </q-btn> -->
          <q-btn
            v-if="userManager.me"
            icon="account_circle"
            color="primary"
            flat
            class="icon-button">
            <q-menu
              transition-show="jump-down"
              transition-hide="jump-up"
              :offset="[0, 10]"
              class="profile-menu-popup">
              <div class="profile-menu">
                <div class="profile-menu__header">
                  <q-avatar
                    size="76px"
                    class="profile-menu__avatar">
                    <img
                      src="/images/blankProfile.png"
                      alt="پروفایل کاربر">
                  </q-avatar>

                  <div class="profile-menu__user-info">
                    <div class="profile-menu__name">
                      {{ userManager.me?.firstname }}
                      {{ userManager.me?.lastname }}
                    </div>

                    <div class="profile-menu__username">
                      {{ userManager.me?.username || userManager.me?.email || '-' }}
                    </div>
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="profile-menu__roles">
                  <div class="profile-menu__section-title">
                    نقش‌های کاربر
                  </div>

                  <div class="profile-menu__role-list">
                    <q-chip
                      v-for="role in userManager.me?.roles || []"
                      :key="role.name"
                      color="blue-1"
                      text-color="primary"
                      icon="verified_user"
                      dense>
                      {{ translateRole(role.name) }}
                    </q-chip>

                    <span
                      v-if="!userManager.me?.roles?.length"
                      class="text-grey-6 text-caption">
                      نقشی ثبت نشده است
                    </span>
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="profile-menu__actions">
                  <q-btn
                    v-close-popup
                    unelevated
                    no-caps
                    color="primary"
                    icon="manage_accounts"
                    label="ویرایش پروفایل"
                    class="profile-menu__edit-btn"
                    @click="goToProfileEdit" />

                  <q-btn
                    v-close-popup
                    outline
                    no-caps
                    color="negative"
                    icon="logout"
                    label="خروج از حساب"
                    class="profile-menu__logout-btn"
                    @click="logout" />
                </div>
              </div>
            </q-menu>

          </q-btn>
          <q-btn
            v-else
            icon="login"
            color="primary"
            outline
            :to="{ name: 'Auth.Login' }" />
        </div>
      </q-toolbar-title>
    </q-toolbar>
  </div>
</template>

<style scoped lang="scss">
.main-dashboard-wrapper {
  $header-height: 50px;
  //background: $gray-100;
  background: transparent;
  min-height: $header-height;
  padding: $space-4 $space-4 $space-4 $space-10;
  .main-dashboard {
    border-radius: 1rem;
    padding: $space-3 $space-4 $space-3 $space-16;
    transition:
      box-shadow 0.25s ease-in,
      background-color 0.25s ease-in;
    position: relative;
    .toggle-mini-btn {
      position: absolute;
      left: $space-3;
      top: 50%;
      transform: translateY(-50%);
    }
    .main-dashboard__main-section {
      height: $header-height;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .main-dashboard__right-section {
        display: flex;
        flex-direction: column;
        gap: $space-2;
        .pageCategory {
          color: $color-text1;
          @include typo-title-3;
        }
      }
      .main-dashboard__left-section {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: $space-2;
        .q-btn {
          color: $neutral-30;
          background: $neutral-95;
        }
        .time {
          color: $color-text2;
          margin-right: $space-2;
          direction: rtl;
          @include typo-body-3;
        }
      }
    }
  }
  &.floated {
    .main-dashboard {
      box-shadow:
        inset 0 0 1px 1px rgba(254, 254, 254, 0.9),
        0 20px 27px 0 rgba(0, 0, 0, 0.05) !important;
      backdrop-filter: saturate(200%) blur(30px);
      background-color: rgba(255, 255, 255, 0.4) !important;
    }
  }
}
:global(.search-in-menu__input) {
  position: sticky;
  top: $spacing-none;
  padding-top: $space-3;
  background: $neutral-100;
  z-index: 1;
}
.search-input {
  margin: 10px;
}

.profile-menu-popup {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(35, 48, 68, 0.16);
}

.profile-menu {
  width: 290px;
  padding: 20px;
  direction: rtl;
  background: $neutral-100;

  &__header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__avatar {
    box-shadow: 0 5px 15px rgba(25, 118, 210, 0.2);
    flex-shrink: 0;
  }

  &__user-info {
    min-width: 0;
    text-align: right;
  }

  &__name {
    color: $color-text1;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.8;
  }

  &__username {
    overflow: hidden;
    color: $color-text2;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: ltr;
    text-align: right;
  }

  &__section-title {
    margin-bottom: 8px;
    color: $color-text2;
    font-size: 12px;
    font-weight: 600;
  }

  &__role-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  &__edit-btn,
  &__logout-btn {
    width: 100%;
    min-height: 42px;
    border-radius: 10px;
  }

  &__edit-btn {
    box-shadow: 0 5px 12px rgba(25, 118, 210, 0.18);
  }
}

</style>
