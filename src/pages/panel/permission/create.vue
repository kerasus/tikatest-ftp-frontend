<template>
  <entity-create
    v-model:value="inputs"
    :title="label"
    :api="api"
    :entity-id-key="entityIdKey"
    :entity-param-key="entityParamKey"
    :index-route-name="indexRouteName"
    :show-route-name="showRouteName"
    :show-expand-button="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import getInputs from './inputs'
import { EntityCreate } from 'quasar-crud'
import PermissionAPI from 'src/repositories/permission'

const permissionAPI = new PermissionAPI()

const api = ref(permissionAPI.endpoints.base)
const label = ref('تجهیز جدید')
const indexRouteName = ref('Panel.Permission.List')
const showRouteName = ref('Panel.Permission.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')

const inputs = ref([
  {
    type: 'select',
    name: 'action',
    options: [
      { label: 'خواندن', value: 'read' },
      { label: 'نوشتن', value: 'write' },
      { label: 'پاک کردن', value: 'delete' }
    ],
    label: 'نوع عملیات',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'select',
    name: 'season',
    options: [
      { label: 'بهار 1405', value: '1405-01' },
      { label: 'تابستان 1405', value: '1405-04' },
      { label: 'پاییز 1405', value: '1405-07' },
      { label: 'زمستان 1405', value: '1405-010' }
    ],
    label: 'آرشیو',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'select',
    name: 'lesson',
    options: [
      'ریاضی',
      'علوم',
      'فیزیک',
      'شیمی',
      'هندسه'
    ],
    label: 'نام درس',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  },
  {
    type: 'select',
    name: 'grade',
    options: [
      '6',
      '7',
      '8',
      '9'
    ],
    label: 'پایه',
    placeholder: ' ',
    col: 'col-md-3 col-12'
  }
])
</script>
