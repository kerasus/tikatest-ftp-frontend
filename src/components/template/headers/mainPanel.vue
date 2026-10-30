<script setup lang="ts">
import { useQuasar } from 'quasar'
import moment from 'jalali-moment'
import { useUser } from 'src/stores/user'
import { useAppLayout } from 'stores/appLayout'
import { ref, onMounted, onUnmounted } from 'vue'
import { useHeaderBreadCrumbs } from 'src/stores/headerBreadCrumbs'
import UserProfileMenu from 'src/components/template/headers/UserProfileMenu.vue'

withDefaults(defineProps<{ floated?: boolean }>(), {
  floated: false
})

const $q = useQuasar()
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
                {{ breadCrumb.label }}
              </q-breadcrumbs-el>
            </q-breadcrumbs>
          </div>
          <div class="pageCategory">
            {{ headerBreadCrumbsStore.pageCategory }}
          </div>
        </div>

        <div class="main-dashboard__center-section" />

        <div class="main-dashboard__left-section">
          <div class="time">
            {{ formattedDate }}
            <q-icon name="remove" />
            {{ formattedTime }}
          </div>

          <!-- کامپوننت پروفایل کاربر -->
          <user-profile-menu v-if="userManager.me" />

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
</style>
