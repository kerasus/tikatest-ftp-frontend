<template>
  <entity-edit
    :key="entityEditKey"
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
import getInputs from './inputs'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { EntityEdit } from 'quasar-crud'
import PermissionAPI from 'src/repositories/permission'

const route = useRoute()
const permissionAPI = new PermissionAPI()

const entityEditKey = ref(Date.now())
const entityId = computed(() => (route.params.id ? parseInt(route.params.id?.toString()) : 0))
const api = ref(permissionAPI.endpoints.byId(entityId.value))
const label = ref('ویرایش تجهیز')
const indexRouteName = ref('Panel.Permission.List')
const showRouteName = ref('Panel.Permission.Show')
const entityIdKey = ref('id')
const entityParamKey = ref('id')

const inputs = ref([
  ...getInputs()
])
</script>
