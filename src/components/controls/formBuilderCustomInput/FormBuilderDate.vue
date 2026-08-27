<template>
  <div
    class="form-builder-date"
    :class="customClass">
    <q-input
      ref="input"
      v-model="displayDateTime"
      :name="name"
      :loading="loading"
      :filled="filled"
      :mask="mask"
      :disable="disable"
      :fill-mask="fillMask"
      :reverse-fill-mask="reverseFillMask"
      dir="ltr"
      :label="label"
      :stack-label="!!placeholder"
      :placeholder="placeholder"
      :rules="localRules"
      :lazy-rules="lazyRules"
      :outlined="outlined"
      :class="customClass"
      :input-class="customClass"
      :error="!!localErrorMessage"
      :error-message="
        localErrorData ? $t(localErrorData.message, localErrorData.namedValue) : undefined
      "
      @clear="onClear"
      @update:model-value="onChangeInputDate"
      @keydown="onKeydown">
      <template #append>
        <q-icon
          v-if="clearable"
          v-show="showClearAble"
          name="cancel"
          class="cursor-pointer"
          @click="onClear" />
        <q-icon
          name="calendar_month"
          class="cursor-pointer"
          @click="toggleMenu" />
      </template>
    </q-input>
    <q-menu
      v-model="popupDate"
      :persistent="persistentMenu"
      no-parent-event
      anchor="bottom left"
      self="top left"
      transition-show="jump-down"
      transition-hide="jump-up">
      <q-date
        v-model="displayDateTime"
        :calendar="calendar"
        :range="range"
        :multiple="multiple"
        :disable="disable"
        :today-btn="todayBtn"
        :options="daysOptions"
        minimal
        @update:model-value="onChangeDate">
        <div class="row items-center justify-end">
          <q-btn
            v-close-popup
            label="بستن"
            :color="closeColorBtn"
            flat />
        </div>
      </q-date>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ValidationRule } from 'quasar'
import { useDate } from 'src/composables/Date'
import type { PropType, ComputedRef } from 'vue'
import { ref, watch, type Ref, computed, type ModelRef } from 'vue'

export interface LocalErrorDataType {
  message: string;
  namedValue: Record<string, unknown>;
}

defineOptions({
  name: 'FormBuilderDate'
})

const dateManager = useDate()
const i18n = useI18n()

const props = defineProps({
  name: {
    default: '',
    type: String
  },
  calendar: {
    type: String as PropType<'gregorian' | 'persian' | undefined>,
    default: 'persian'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  calendarIcon: {
    type: String,
    default: 'oms:calendar'
  },
  clockIcon: {
    type: String,
    default: 'oms:clock'
  },
  title: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  closeColorBtn: {
    default: 'primary',
    type: String
  },
  multiple: {
    type: Boolean,
    default: false
  },
  range: {
    type: Boolean,
    default: false
  },
  iso8601: {
    type: Boolean,
    default: true
  },
  todayBtn: {
    type: Boolean,
    default: false
  },
  fillMask: {
    type: String,
    default: undefined
  },
  reverseFillMask: {
    type: Boolean,
    default: undefined
  },
  mask: {
    type: String,
    default: '####/##/##'
  },
  label: {
    default: '',
    type: String || null
  },
  class: {
    default: '',
    type: String
  },
  error: {
    default: false,
    type: Boolean
  },
  errorMessage: {
    default: '',
    type: String
  },
  disable: {
    default: false,
    type: Boolean
  },
  readonly: {
    default: false,
    type: Boolean
  },
  filled: {
    default: false,
    type: Boolean
  },
  dense: {
    default: true,
    type: Boolean
  },
  rounded: {
    default: false,
    type: Boolean
  },
  outlined: {
    default: false,
    type: [Boolean]
  },
  rules: {
    default: () => [] as ValidationRule[],
    type: Array as PropType<ValidationRule[]>
  },
  lazyRules: {
    default: false,
    type: [Boolean]
  },
  loading: {
    default: false,
    type: Boolean
  },
  limitFuture: {
    default: false,
    type: Boolean || String
  }
})

const displayDateTime: Ref<string> = ref('')
const popupDate = ref(false)
// const popupTime = ref(false)
const persistentMenu = ref(false)
const input = ref<HTMLInputElement | null>(null)
const localErrorMessage: Ref<string | null> = ref(null)

const value: ModelRef<string | null> = defineModel('value', {
  type: String,
  default: null
})

const customClass = computed(() => props.class)
const showClearAble = computed(() => displayDateTime.value !== '____/__/__')

const localErrorData: ComputedRef<LocalErrorDataType | undefined> = computed(() => {
  if (!localErrorMessage.value) {
    return undefined
  }
  const errorData: LocalErrorDataType = { message: localErrorMessage.value, namedValue: {} }
  if (errorData.message === 'error.validation.required') {
    errorData.namedValue = { field: props.label }
  }

  return errorData
})

const localRules = computed(() =>
  props.rules.map((rule: any) => {
    if (rule.ruleName === 'required') {
      const ruleName = rule.ruleName
      const ruleParams = rule.ruleParams
      rule = (): boolean | string => {
        if (displayDateTime.value === '____/__/__') {
          return i18n.t('error.validation.required', { field: props.label })
        } else if (localErrorMessage.value) {
          return false
        } else {
          return true
        }
      }

      rule.ruleName = ruleName
      rule.ruleParams = ruleParams
    }

    return rule
  })
)

watch(
  () => value.value,
  (newValue) => {
    if (!newValue) {
      displayDateTime.value = '____/__/__'
      return
    }
    value.value = dateManager.getDateTimeFromIso8601DateString(newValue).date
    displayDateTime.value = dateManager.miladiToShamsi(newValue.toString())
  },
  { immediate: true }
)

watch(
  () => props.errorMessage,
  () => {
    localErrorMessage.value = props.errorMessage
  },
  { immediate: true }
)

function onChangeInputDate () {
  const dateManager = useDate()
  const analysedShamsiDate = dateManager.validationShamsiDate(displayDateTime.value)

  if (analysedShamsiDate.isValid) {
    localErrorMessage.value = null
    if (analysedShamsiDate.shamsiDate) {
      onChangeDate(analysedShamsiDate.shamsiDate)
    }
  } else {
    localErrorMessage.value = analysedShamsiDate.message
  }
}

// newValue can be miladi or shamsi
function onChangeDate (newValue: string) {
  if (!newValue) {
    onClear()
    return
  }
  let gregorianDate = newValue
  if (props.calendar === 'persian') {
    gregorianDate = dateManager.shamsiToMiladi(newValue.toString())
  }
  displayDateTime.value = newValue.toString()
  value.value = gregorianDate
}

function onClear () {
  displayDateTime.value = '____/__/__'
  value.value = null
}

function toggleMenu () {
  popupDate.value = !popupDate.value
}

function openMenu () {
  persistentMenu.value = true
  popupDate.value = true
  input.value?.focus()
}

function onKeydown (e: KeyboardEvent) {
  const allowedKeys = [
    'Backspace',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'Tab',
    'Shift',
    'Control',
    'Alt',
    'Escape',
    'End',
    'Home',
    'Delete'
  ]
  if (e.key === 'ArrowDown') {
    openMenu()
    input.value?.focus()
    return
  }
  if (e.key === ' ') {
    e.preventDefault()
  }

  const isModifierCombination =
    (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'z', 'y'].includes(e.key.toLowerCase())

  if (
    Number.isNaN(Number(e.key)) &&
    !e.ctrlKey &&
    !e.altKey &&
    !e.metaKey &&
    !isModifierCombination &&
    !allowedKeys.includes(e.key)
  ) {
    e.preventDefault()
  }
}

function daysOptions (date: string) {
  if (!props.limitFuture) {
    return true
  }
  const limitFutureDate =
    typeof props.limitFuture === 'boolean' ? new Date() : new Date(props.limitFuture)
  const dateDate = new Date(dateManager.shamsiToMiladi(date))

  if (typeof props.limitFuture === 'string') {
    return dateDate <= limitFutureDate
  }
  return dateDate <= limitFutureDate
}

watch(displayDateTime, onChangeInputDate)
</script>
