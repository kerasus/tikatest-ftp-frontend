<template>
  <q-card>
    <q-card-section>
      <div class="row">
        <div class="col-8">
          <div class="title">
            {{ title }}
          </div>
          <div class="value">
            <q-skeleton
              v-if="loading"
              type="text" />
            <template v-else-if="!isNaN(number)">
              <currency-number
                :number="number"
                :show-status-color="showStatusColor" />
              {{ suffix }}
            </template>
            <template v-else>
              -
            </template>
          </div>
        </div>
        <div class="col-4 flex justify-end">
          <div class="icon-shape">
            <q-icon :name="icon" />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import CurrencyNumber from 'src/components/CurrencyNumber.vue'

defineProps<{
  icon: string,
  title: string,
  number: number,
  suffix?: string,
  showStatusColor?: boolean
  loading?: boolean
}>()
</script>


<style scoped lang="scss">

</style>
