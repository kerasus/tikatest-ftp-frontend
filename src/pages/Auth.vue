<template>
  <div class="auth-vibrant-container flex flex-center">
    <!-- حباب‌ها و اورب‌های پس‌زمینه با دامنه و سرعت بالا -->
    <div class="vibrant-orb vibrant-orb--purple" />
    <div class="vibrant-orb vibrant-orb--pink" />
    <div class="vibrant-orb vibrant-orb--amber" />
    <div class="vibrant-orb vibrant-orb--cyan" />

    <!-- المان‌های فانتزی معلق با حرکت پرانرژی و متناوب -->
    <div class="float-gem float-gem--1">
      <q-icon
        name="cloud"
        size="26px"
        class="text-white" />
    </div>
    <div class="float-gem float-gem--2">
      <q-icon
        name="folder_zip"
        size="24px"
        class="text-white" />
    </div>
    <div class="float-gem float-gem--3">
      <q-icon
        name="rocket_launch"
        size="22px"
        class="text-white" />
    </div>
    <div class="float-gem float-gem--4">
      <q-icon
        name="bolt"
        size="24px"
        class="text-white" />
    </div>

    <!-- کارت کریستالی چندرنگ با چرخش نئونی فوق‌سریع -->
    <div class="vibrant-glass-wrapper">
      <div class="animated-gradient-border" />

      <div class="vibrant-glass-card">
        <!-- رفلکس درخشش متحرک شیشه -->
        <div class="card-shimmer" />

        <div class="column items-center justify-center full-width relative-position">

          <!-- بج لوگو با حلقه چرخان پرانرژی -->
          <div
            class="logo-vibrant-badge q-mb-md cursor-pointer"
            @click="goToHomePage">
            <div class="logo-spinning-halo" />
            <div class="logo-inner-glass">
              <q-img
                src="/images/logo.png"
                class="auth-logo-img"
                alt="لوگوی آموزشگاه" />
            </div>
          </div>

          <!-- تگ کپسولی رنگین‌کمانی فانتزی -->
          <div class="vibrant-badge-tag q-mb-sm">
            <span class="sparkle-dot" />
            <span class="tag-text">مرکز ابری اسناد و ویدیوها</span>
            <q-icon
              name="auto_awesome"
              size="14px"
              class="q-ml-xs text-amber-3" />
          </div>

          <!-- عنوان چندرنگ و هولوگرافیک -->
          <h1 class="vibrant-title q-mb-lg text-center">
            پنل آپلود آموزشگاه اسدی کیا
          </h1>

          <!-- فرم احراز هویت -->
          <div class="auth-inner-form-shell full-width">
            <auth-component class="auth-component-custom" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AuthComponent from 'src/components/AuthComponent.vue'

const router = useRouter()

defineOptions({
  name: 'AuthPage'
})

function goToHomePage () {
  router.push({ name: 'HomePage' })
}
</script>

<style lang="scss" scoped>
.auth-vibrant-container {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  background:
    radial-gradient(at 0% 0%, rgba(254, 240, 138, 0.5) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(244, 114, 182, 0.45) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.5) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(168, 85, 247, 0.45) 0px, transparent 50%),
    #f8fafc;
  overflow: hidden;
  direction: rtl;
  padding: 24px 16px;
}

/* ========================================================
   اورب‌های پس‌زمینه با دامنه و سرعت بالا
======================================================== */
.vibrant-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.8;
  /* سرعت از ۱۲ ثانیه به ۵.۵ ثانیه افزایش یافته و جابه‌جایی عمیق‌تر شده */
  animation: dynamic-orb 5.5s infinite alternate ease-in-out;

  &--purple {
    width: 460px;
    height: 460px;
    background: linear-gradient(135deg, #a855f7, #6366f1);
    top: -100px;
    right: -80px;
  }

  &--pink {
    width: 420px;
    height: 420px;
    background: linear-gradient(135deg, #f43f5e, #fb7185);
    bottom: -80px;
    left: -70px;
    animation-delay: -1.8s;
  }

  &--amber {
    width: 340px;
    height: 340px;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    top: 5%;
    left: 15%;
    animation-delay: -3.2s;
    opacity: 0.55;
  }

  &--cyan {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    bottom: 5%;
    right: 15%;
    animation-delay: -4.5s;
    opacity: 0.7;
  }
}

@keyframes dynamic-orb {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  50% {
    transform: translate(90px, -70px) scale(1.3) rotate(35deg);
  }
  100% {
    transform: translate(-70px, 80px) scale(0.9) rotate(-35deg);
  }
}

/* ========================================================
   المان‌های معلق با دامنه حرکتی وسیع و پرانرژی (Gems)
======================================================== */
.float-gem {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  backdrop-filter: blur(14px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.16);
  z-index: 1;
  pointer-events: none;

  &--1 {
    width: 62px;
    height: 62px;
    top: 12%;
    left: 12%;
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    border: 2.5px solid rgba(255, 255, 255, 0.75);
    animation: energetic-float-1 8.2s infinite ease-in-out;
  }

  &--2 {
    width: 56px;
    height: 56px;
    bottom: 14%;
    right: 10%;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    border: 2.5px solid rgba(255, 255, 255, 0.75);
    animation: energetic-float-2 7.8s infinite ease-in-out;
  }

  &--3 {
    width: 50px;
    height: 50px;
    top: 20%;
    right: 14%;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    border: 2px solid rgba(255, 255, 255, 0.75);
    animation: energetic-float-3 9.5s infinite ease-in-out;
  }

  &--4 {
    width: 48px;
    height: 48px;
    bottom: 22%;
    left: 15%;
    background: linear-gradient(135deg, #10b981, #06b6d4);
    border: 2px solid rgba(255, 255, 255, 0.75);
    animation: energetic-float-1 4.8s infinite ease-in-out reverse;
  }
}

/* انیمیشن‌های چندجهته با دامنه حرکتی ۵۰+ پیکسل و چرخش پرانرژی */
@keyframes energetic-float-1 {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  35% {
    transform: translate(25px, -55px) rotate(22deg) scale(1.12);
  }
  70% {
    transform: translate(-30px, -25px) rotate(-18deg) scale(0.95);
  }
}

@keyframes energetic-float-2 {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  40% {
    transform: translate(-35px, -50px) rotate(-28deg) scale(1.15);
  }
  80% {
    transform: translate(20px, 35px) rotate(20deg) scale(0.92);
  }
}

@keyframes energetic-float-3 {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(30px, 55px) rotate(35deg) scale(1.1);
  }
}

/* ========================================================
   کارت کریستالی با بوردر نئونی پرسرعت
======================================================== */
.vibrant-glass-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  border-radius: 36px;
  padding: 3.5px;
  overflow: hidden;
  box-shadow:
    0 30px 60px -12px rgba(124, 58, 237, 0.3),
    0 12px 30px rgba(236, 72, 153, 0.2);
  animation: card-appear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes card-appear {
  from { opacity: 0; transform: translateY(30px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* سرعت چرخش نوار نئونی افزایش پیدا کرده (از ۷s به ۳s) */
.animated-gradient-border {
  position: absolute;
  inset: -150%;
  background: conic-gradient(
    from 0deg,
    #ec4899,
    #8b5cf6,
    #3b82f6,
    #06b6d4,
    #10b981,
    #f59e0b,
    #ec4899
  );
  animation: rotate-border 10s linear infinite;
}

@keyframes rotate-border {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vibrant-glass-card {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(35px) saturate(220%);
  -webkit-backdrop-filter: blur(35px) saturate(220%);
  border-radius: 33px;
  padding: 42px 34px;
  overflow: hidden;
}

/* درخشش مداوم و نوری شیشه با ترنزیشن نرم */
.card-shimmer {
  position: absolute;
  top: -80%;
  left: -80%;
  width: 260%;
  height: 260%;
  background: linear-gradient(
    45deg,
    transparent 35%,
    rgba(255, 255, 255, 0.65) 50%,
    transparent 65%
  );
  transform: rotate(30deg);
  pointer-events: none;
  animation: sweep-shimmer 4s infinite ease-in-out;
}

@keyframes sweep-shimmer {
  0% { transform: translateY(-40px) rotate(30deg); }
  50% { transform: translateY(40px) rotate(30deg); }
  100% { transform: translateY(-40px) rotate(30deg); }
}

/* ========================================================
   بج لوگو با هاله رقصان
======================================================== */
.logo-vibrant-badge {
  position: relative;
  width: 105px;
  height: 105px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-6px) scale(1.08);

    .logo-spinning-halo {
      filter: blur(14px);
      opacity: 1;
    }
  }

  .logo-spinning-halo {
    position: absolute;
    inset: -5px;
    border-radius: 34px;
    background: linear-gradient(135deg, #f43f5e, #8b5cf6, #06b6d4, #f59e0b);
    z-index: 0;
    opacity: 0.8;
    filter: blur(8px);
    animation: rotate-border 10s linear infinite;
  }

  .logo-inner-glass {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.96);
    border: 2px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.8);
  }

  .auth-logo-img {
    width: 66px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
  }
}

/* ========================================================
   تگ کپسولی
======================================================== */
.vibrant-badge-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #d946ef);
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(217, 70, 239, 0.35);
  border: 1.5px solid rgba(255, 255, 255, 0.5);

  .sparkle-dot {
    width: 7px;
    height: 7px;
    background-color: #fde047;
    border-radius: 50%;
    margin-left: 6px;
    box-shadow: 0 0 10px #fde047;
    animation: blink-dot 0.8s infinite alternate;
  }
}

@keyframes blink-dot {
  from { opacity: 0.3; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1.4); }
}

/* ========================================================
   تایپوگرافی
======================================================== */
.vibrant-title {
  margin: 6px 0 0;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.4;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #4338ca 0%, #a21caf 50%, #e11d48 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 20px rgba(162, 28, 175, 0.15);
}

.auth-inner-form-shell {
  .auth-component-custom {
    width: 100%;
  }
}
</style>
