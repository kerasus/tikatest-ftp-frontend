<template>
  <q-card class="unit-profile-tab-header">
    <div class="content">
      <div class="financial-section">
        <div class="row q-col-gutter-md justify-lg-end justify-center">
          <q-btn
            color="primary"
            icon="refresh"
            class="refresh-balance-btn"
            :loading="balanceLoading"
            @click="updateBalance" />
          <div class="col-md-6 col-12">
            <q-skeleton
              v-if="!unit"
              height="150px" />
            <dashboard-card
              v-else
              title="تراز مالی مالک"
              icon="account_balance"
              :number="ownerBalance"
              show-status-color />
          </div>
          <div class="col-md-6 col-12">
            <q-skeleton
              v-if="!unit"
              height="150px" />
            <dashboard-card
              v-else
              title="تراز مالی ساکن"
              icon="account_balance"
              :number="residentBalance"
              show-status-color />
          </div>
        </div>
      </div>
      <div class="unit-info">
        <div class="row q-mt-md">
          <div class="col-md-12">
            <span>
              {{ unit?.type_label }}
            </span>
            -
            <span>
              {{ unit?.area }}
              متر
            </span>
            -
            <span>
              {{ unit?.number_of_rooms }}
              خوابه
            </span>
            -
            <span>
              دارای
              {{ unit?.parking_spaces }}
              پارکینگ
            </span>
            -
            <span class="text-bold">
              طبقه
              {{ unit?.floor }}
            </span>
            -
            <span class="text-bold">
              واحد
              {{ unit?.unit_number }}
            </span>
            -
            <span class="text-bold">
              تعداد ساکنین
              {{ unit?.number_of_residents }}
              نفر
            </span>
          </div>
          <div class="col-12">
            <div>
              توضیحات:
            </div>
            <!--            <div v-html="unit?.description" />-->
          </div>
        </div>
      </div>
      <q-tabs
        v-model="tab"
        stretch
        dense
        align="justify">
        <q-tab
          v-for="(tabItem, tabIndex) in tabs"
          :key="tabIndex"
          :name="tabItem.name"
          :label="tabItem.label" />
      </q-tabs>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, defineModel, computed } from 'vue'
import DashboardCard from 'src/components/DashBoardCard.vue'

const props = defineProps<{
  unit: Record<string, any> | null;
  balanceLoading: boolean;
}>()

const tab = defineModel<'actions' | 'invoices' | 'transactions'>('tab')

const emits = defineEmits(['updateBalance'])

const tabs = ref([
  {
    name: 'actions',
    label: 'عملیات'
  },
  {
    name: 'invoices',
    label: 'فاکتورها'
  },
  {
    name: 'transactions',
    label: 'تراکنش ها'
  }
])

const ownerBalance = computed(() => {
  if (props.unit === null) {
    return 0
  }

  return props.unit.current_owner_balance ? props.unit.current_owner_balance : 0
})

const residentBalance = computed(() => {
  if (props.unit === null) {
    return 0
  }

  return props.unit.current_resident_balance ? props.unit.current_resident_balance : 0
})

function updateBalance () {
  emits('updateBalance')
}
</script>

<style scoped lang="scss">
$content-height-lg: 200px;
$content-height-md: 250px;
$content-height-sm: 350px;
$x-gap-md: $space-6;
$x-gap-sm: $space-2;
.unit-profile-tab-header {
  position: relative;
  background: url('/images/background/green-leaves-background.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  height: 300px;
  margin-bottom: calc( #{$content-height-lg} / 2 );

  .content {
    position: absolute;
    width: auto;
    height: $content-height-lg;
    left: $x-gap-md;
    right: $x-gap-md;
    padding-top: $space-3;
    padding-left: $space-3;
    padding-right: $space-3;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: start;
    transform: translateY(50%);
    -webkit-backdrop-filter: saturate(200%) blur(30px);
    backdrop-filter: saturate(200%) blur(30px);
    background-color: rgba(255, 255, 255, 0.8) !important;
    box-shadow: inset 0 0 1px 1px rgba(254, 254, 254, 0.9), 0 20px 27px 0 rgba(0, 0, 0, 0.05) !important;
    :deep(.q-tabs) {
      color: #344767;
      border-bottom: none;
      .q-tabs__content {
        padding-bottom: $space-1;
        .q-tab {
          .q-focus-helper {
            display: none;
            border-radius: 0.5rem;
            z-index: 0;
            order: 1;
          }
          .q-tab__content {
            z-index: 2;
            order: 3;
          }
          &.q-tab--active {
            .q-tab__indicator {
              z-index: 2;
              order: 2;
              height: 100%;
              opacity: 1;
              //border-radius: 0.75rem;
              border-radius: 0.5rem;
              color: #fff;
              font-weight: 600;
              box-shadow: 0px 1px 5px 1px #ddd;
              animation: 0.2s ease;
              background: #fff;
            }
          }
        }
      }
    }
    .financial-section {
      .refresh-balance-btn {
        position: absolute;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: $space-4;
        right: $space-1;
        top: $space-1;
        z-index: 1;
      }
    }
  }

  @media screen and (width < 1440px) {
    margin-bottom: calc( #{$content-height-md} / 2 );
    .content {
      height: $content-height-md;
      .financial-section {
        .refresh-balance-btn {
          right: $space-1;
          top: $space-13;
        }
      }
    }
  }
  @media screen and (width < 1024px) {
    margin-bottom: calc( #{$content-height-sm} / 2 );
    .content {
      height: $content-height-sm;
    }
  }
  @media screen and (width < 700px) {
    .content {
      left: $x-gap-sm;
      right: $x-gap-sm;
    }
  }
}
</style>
