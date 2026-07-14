<template>
  <q-card>
    <q-card-section class="text-center">
      <div class="header">
        <div class="icon-shape">
          <q-icon :name="icon" />
        </div>
      </div>
      <div class="title">
        {{ title }}
      </div>
      <q-separator class="q-my-md" />
      <div class="value">
        <currency-number
          :number="number"
          :show-status-color="showStatusColor" />
        {{ numberUnit }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import CurrencyNumber from 'components/CurrencyNumber.vue'

defineProps<{
  icon: string,
  title: string,
  number: number,
  numberUnit: string,
  showStatusColor?: boolean
}>()
</script>


<style scoped lang="scss">
.header {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: $space-5;
}
</style>
