<template>
  <entity-show
    v-model:value="inputs"
    :title="label"
    :api="api"
    :entity-id-key="entityIdKey"
    :entity-param-key="entityParamKey"
    :index-route-name="indexRouteName"
    :show-route-name="showRouteName"
    :edit-route-name="editRouteName"
    :show-expand-button="false" />
</template>

<script setup lang="ts">
import getInputs from './inputs'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { EntityShow } from 'quasar-crud'
import PermissionAPI from 'src/repositories/permission'

const permissionAPI = new PermissionAPI()
const route = useRoute()

const entityId = computed(() => (route.params.id ? parseInt(route.params.id?.toString()) : 0))

const api = ref(permissionAPI.endpoints.byId(entityId.value))
const label = ref('مشاهده تجهیز')
const indexRouteName = ref('Panel.Permission.List')
const showRouteName = ref('Panel.Permission.Show')
const editRouteName = ref('Panel.Permission.Edit')
const entityIdKey = ref('id')
const entityParamKey = ref('id')

const inputs = ref([
  ...getInputs()
])
</script>
