<template>
  <div
    class="auth-component"
    dir="rtl">
    <q-form
      class="auth-form"
      @submit="onClickLoginBtn">
      <!-- نام کاربری -->
      <div class="auth-field auth-field--username">
        <div class="auth-field__heading">
          <span class="auth-field__label">نام کاربری</span>
          <span class="auth-field__caption">شناسه ورود شما</span>
        </div>

        <q-input
          ref="usernameInput"
          v-model="username"
          class="auth-input"
          outlined
          hide-bottom-space
          autocomplete="username"
          name="username"
          aria-label="نام کاربری"
          placeholder="نام کاربری‌تان را وارد کنید"
          input-class="auth-input__native"
          :disable="loginLoading"
          :rules="usernameRules"
          lazy-rules
          @keydown.enter.stop.prevent="focusPassword">
          <template #prepend>
            <span class="field-icon field-icon--username">
              <q-icon
                name="person_outline"
                size="22px" />
            </span>
          </template>
        </q-input>
      </div>

      <!-- کلمه عبور -->
      <div class="auth-field auth-field--password">
        <div class="auth-field__heading">
          <span class="auth-field__label">کلمه عبور</span>
          <span class="auth-field__caption">کلید ورود به پنل</span>
        </div>

        <q-input
          ref="passwordInput"
          v-model="password"
          class="auth-input"
          outlined
          hide-bottom-space
          autocomplete="current-password"
          name="password"
          aria-label="کلمه عبور"
          placeholder="کلمه عبورتان را وارد کنید"
          input-class="auth-input__native"
          :type="passwordVisibility ? 'text' : 'password'"
          :disable="loginLoading"
          :rules="passwordRules"
          lazy-rules>
          <template #prepend>
            <span class="field-icon field-icon--password">
              <q-icon
                name="lock_outline"
                size="21px" />
            </span>
          </template>

          <template #append>
            <q-btn
              class="password-toggle"
              type="button"
              flat
              round
              dense
              :disable="loginLoading"
              :icon="passwordVisibility ? 'visibility' : 'visibility_off'"
              :aria-label="
                passwordVisibility
                  ? 'پنهان کردن کلمه عبور'
                  : 'نمایش کلمه عبور'
              "
              :aria-pressed="passwordVisibility"
              @click="onClickPasswordVisibility" />
          </template>
        </q-input>
      </div>

      <!-- دکمه ورود -->
      <div class="auth-component__action-area">
        <q-btn
          class="login-button"
          type="submit"
          unelevated
          no-caps
          :loading="loginLoading"
          :disable="loginLoading">
          <span class="login-button__content">
            <span class="login-button__icon">
              <q-icon
                name="login"
                size="21px" />
            </span>

            <span class="login-button__label">ورود به پنل</span>

            <q-icon
              class="login-button__sparkle"
              name="auto_awesome"
              size="19px" />
          </span>

          <template #loading>
            <span
              class="login-button__loading"
              role="status">
              <q-spinner-dots
                color="white"
                size="28px" />
              <span>در حال ورود...</span>
            </span>
          </template>
        </q-btn>

        <div class="auth-footnote">
          <span
            class="auth-footnote__decoration"
            aria-hidden="true">
            <i />
            <i />
            <i />
          </span>

          <span>آموزش، یک قدم نزدیک‌تر</span>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import type { QInput } from 'quasar'
import { useRouter } from 'vue-router'
import { useAppConfig } from 'src/stores/appConfig'
import { axiosInstanceManager } from 'src/boot/axios'

const $q = useQuasar()
const router = useRouter()
const i18nManager = useI18n()
const appConfigManager = useAppConfig()

const loginLoading = ref(false)
const username = ref<string | null>(null)
const password = ref<string | null>(null)
const passwordVisibility = ref(false)

const usernameInput = ref<QInput | null>(null)
const passwordInput = ref<QInput | null>(null)

const usernameRules = [
  (value: string | null) =>
    Boolean(value?.trim()) || 'نام کاربری را وارد کنید'
]

const passwordRules = [
  (value: string | null) =>
    Boolean(value) || 'کلمه عبور را وارد کنید'
]

function onClickPasswordVisibility () {
  passwordVisibility.value = !passwordVisibility.value
}

function focusPassword () {
  passwordInput.value?.focus()
}

function isValidAuthPayload () {
  return Boolean(username.value?.trim() && password.value)
}

async function onClickLoginBtn () {
  if (loginLoading.value || !isValidAuthPayload()) {
    return
  }

  loginLoading.value = true

  try {
    axiosInstanceManager.setCredentials(
      username.value ?? '',
      password.value ?? '',
      '111111'
    )

    await axiosInstanceManager.obtainMainToken()
    await redirectAfterLogin()
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? i18nManager.t(error.message)
        : i18nManager.t('ورود انجام نشد. دوباره تلاش کنید.')

    $q.notify({
      classes: 'snack--negative snack--inline-action',
      icon: 'info',
      message,
      timeout: 20000,
      actions: [
        {
          icon: 'close',
          class: 'icon-button'
        }
      ]
    })
  } finally {
    loginLoading.value = false
  }
}

async function redirectAfterLogin () {
  const defaultRoute = {
    name: 'Panel.File.Upload',
    params: {}
  }

  const redirectLocation =
    appConfigManager.redirectAfterLogin || defaultRoute

  await router.push(redirectLocation)
}
</script>

<style scoped lang="scss">
.auth-component {
  --auth-ink: #343455;
  --auth-muted: #70708b;
  --auth-purple: #7c3aed;
  --auth-pink: #db2777;

  width: 100%;
  min-width: 0;
  color: var(--auth-ink);
  text-align: start;

  &,
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
}

/* عنوان و توضیح کوچک هر فیلد */
.auth-field {
  min-width: 0;

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin-bottom: 10px;
    padding-inline: 4px;
  }

  &__label {
    font-size: 13px;
    font-weight: 800;
    line-height: 1.7;
  }

  &__caption {
    color: var(--auth-muted);
    font-size: 10px;
    line-height: 1.7;
  }
}

/* فیلدهای شیشه‌ای */
.auth-input {
  :deep(.q-field__control) {
    min-height: 64px;
    padding-inline: 12px;
    border-radius: 19px;
    color: var(--auth-purple);
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.96),
      rgba(246, 243, 255, 0.85)
    );

    box-shadow:
      0 5px 16px rgba(93, 65, 150, 0.045),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);

    transition:
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  :deep(.q-field__control::before) {
    border: 1px solid rgba(167, 139, 250, 0.3);
    transition: border-color 0.25s ease;
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(139, 92, 246, 0.65);
  }

  :deep(.q-field__control::after) {
    border-width: 2px;
  }

  :deep(.q-field__prepend),
  :deep(.q-field__append) {
    height: 64px;
  }

  :deep(.q-field__prepend) {
    padding-inline-end: 12px;
  }

  :deep(.q-field__append) {
    padding-inline-start: 8px;
  }

  :deep(.auth-input__native) {
    min-width: 0;
    color: var(--auth-ink);
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    text-align: start;
    caret-color: var(--auth-purple);

    &::placeholder {
      color: #7d7892;
      font-size: 12px;
      font-weight: 400;
      opacity: 1;
    }
  }

  :deep(.q-field__bottom) {
    padding: 8px 6px 0;
    font-size: 11px;
    line-height: 1.7;
  }

  &.q-field--focused {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.98);
      box-shadow:
        0 0 0 5px rgba(139, 92, 246, 0.09),
        0 10px 24px rgba(124, 58, 237, 0.09);
    }
  }

  &.q-field--error {
    :deep(.q-field__control) {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.07);
    }
  }
}

/* آیکون‌های ژله‌ای */
.field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 13px;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &--username {
    color: #7440d8;
    background: linear-gradient(135deg, #ede5ff, #f5e6ff);
    box-shadow: 0 4px 10px rgba(124, 58, 237, 0.1);
  }

  &--password {
    color: #cc337e;
    background: linear-gradient(135deg, #ffe3ef, #f8e7ff);
    box-shadow: 0 4px 10px rgba(219, 39, 119, 0.1);
  }
}

.auth-field:focus-within .field-icon {
  transform: translateY(-2px) rotate(-6deg);
}

.auth-field--password {
  .auth-input {
    :deep(.q-field__control) {
      color: var(--auth-pink);
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0.96),
        rgba(255, 240, 248, 0.8)
      );
    }

    :deep(.q-field__control::before) {
      border-color: rgba(244, 114, 182, 0.3);
    }

    :deep(.q-field__control:hover::before) {
      border-color: rgba(236, 72, 153, 0.6);
    }

    :deep(.auth-input__native) {
      caret-color: var(--auth-pink);
    }

    &.q-field--focused:not(.q-field--error) {
      :deep(.q-field__control) {
        background: rgba(255, 255, 255, 0.98);
        box-shadow:
          0 0 0 5px rgba(236, 72, 153, 0.08),
          0 10px 24px rgba(219, 39, 119, 0.07);
      }
    }
  }
}

.password-toggle {
  color: #8e719e;
  background: rgba(245, 232, 251, 0.7);
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: #be287d;
    background: #fce0ef;
  }

  &:focus-visible {
    outline: 2px solid var(--auth-pink);
    outline-offset: 3px;
  }
}

/* دکمه ورود رنگی */
.auth-component__action-area {
  padding-top: 4px;
}

.login-button {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 60px;
  padding: 8px 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 19px;
  color: #fff;

  background: linear-gradient(
    110deg,
    #6445df 0%,
    #8c3dde 38%,
    #c631ad 72%,
    #dc397f 100%
  );

  box-shadow:
    0 12px 26px -8px rgba(151, 55, 200, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  /* عبور نوار نور از روی دکمه */
  &::after {
    position: absolute;
    z-index: 0;
    top: -50%;
    bottom: -50%;
    left: -55%;
    width: 35%;
    content: '';
    pointer-events: none;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: translateX(0) skewX(-20deg);
    animation: login-button-shine 3.2s ease-in-out infinite;
  }

  :deep(.q-btn__content) {
    position: relative;
    z-index: 1;
    width: 100%;
  }

  &:not(:disabled):hover {
    transform: translateY(-3px);
    box-shadow:
      0 17px 32px -8px rgba(151, 55, 200, 0.58),
      inset 0 1px 0 rgba(255, 255, 255, 0.45);
  }

  &:not(:disabled):active {
    transform: translateY(0) scale(0.985);
  }

  &:focus-visible {
    outline: 3px solid #a78bfa;
    outline-offset: 4px;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.26);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.16);
  }

  &__label {
    flex: 1;
    font-size: 15px;
    font-weight: 800;
    text-align: start;
  }

  &__sparkle {
    margin-inline-end: 4px;
    color: #fff0ad;
    animation: login-sparkle 2.2s ease-in-out infinite;
  }

  &__loading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 700;
  }
}

/* امضای کوچک زیر فرم */
.auth-footnote {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 20px;
  color: var(--auth-muted);
  font-size: 11px;
  line-height: 1.8;

  &__decoration {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #a78bfa;

      &:nth-child(2) {
        background: #f472b6;
      }

      &:nth-child(3) {
        background: #38bdf8;
      }
    }
  }
}

@keyframes login-button-shine {
  0%,
  25% {
    transform: translateX(0) skewX(-20deg);
    opacity: 0;
  }

  35% {
    opacity: 1;
  }

  75%,
  100% {
    transform: translateX(520%) skewX(-20deg);
    opacity: 0;
  }
}

@keyframes login-sparkle {
  0%,
  100% {
    transform: rotate(-10deg) scale(1);
  }

  50% {
    transform: rotate(12deg) scale(1.18);
  }
}

@media (max-width: 380px) {
  .auth-field__caption {
    display: none;
  }

  .auth-input {
    :deep(.q-field__control) {
      padding-inline: 9px;
    }

    :deep(.q-field__prepend) {
      padding-inline-end: 8px;
    }

    :deep(.auth-input__native::placeholder) {
      font-size: 11px;
    }
  }

  .field-icon {
    width: 32px;
    height: 36px;
    border-radius: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-button::after,
  .login-button__sparkle {
    animation: none;
  }

  .login-button,
  .field-icon,
  .password-toggle,
  :deep(.q-field__control),
  :deep(.q-field__control::before) {
    transition: none;
  }
}
</style>
