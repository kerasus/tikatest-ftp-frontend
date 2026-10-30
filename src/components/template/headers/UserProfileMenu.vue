<template>
  <div
    v-if="userManager.me"
    class="user-profile-wrapper">
    <!-- دکمه تریگر هولوگرافیک در هدر -->
    <div class="hologram-pill-btn cursor-pointer">
      <div class="pill-border-glow" />

      <div class="pill-inner-content flex items-center no-wrap">
        <div class="avatar-orbit">
          <q-avatar
            size="36px"
            class="trigger-avatar">
            <img
              src="/images/blankProfile.png"
              alt="پروفایل کاربر">
          </q-avatar>
          <span class="pulsing-live-dot" />
        </div>

        <div class="user-meta-header gt-xs q-mx-sm">
          <span class="header-name">
            {{ userManager.me?.firstname }} {{ userManager.me?.lastname }}
          </span>
          <span class="header-subtitle">آنلاین و فعال</span>
        </div>

        <div class="icon-toggle-bubble">
          <q-icon
            name="keyboard_arrow_down"
            size="18px"
            class="arrow-icon" />
        </div>
      </div>

      <!-- منوی کشویی کریستالی / Deep Frosted Glass -->
      <q-menu
        transition-show="jump-down"
        transition-hide="jump-up"
        :offset="[0, 16]"
        class="hologram-menu-shell">
        <div class="quantum-glass-card">
          <!-- افکت شکست نور کریستالی شناور -->
          <div class="aurora-orb aurora-1" />
          <div class="aurora-orb aurora-2" />
          <div class="aurora-orb aurora-3" />

          <!-- براش خطی نور شیب‌دار روی کارت -->
          <div class="card-sheen" />

          <!-- بخش پروفایل کاربر با رینگ چرخنده -->
          <div class="profile-hero q-mb-md">
            <div class="avatar-spin-ring">
              <div class="conic-spinner" />
              <q-avatar
                size="72px"
                class="avatar-core">
                <img
                  src="/images/blankProfile.png"
                  alt="پروفایل">
              </q-avatar>
              <div class="vip-sparkle">
                <q-icon
                  name="auto_awesome"
                  size="14px"
                  color="amber-3" />
              </div>
            </div>

            <div class="hero-texts">
              <div class="user-big-name">
                {{ userManager.me?.firstname }} {{ userManager.me?.lastname }}
              </div>
              <div class="user-badge-id">
                <span class="id-symbol">#</span>
                <span class="ellipsis">{{ userManager.me?.username || userManager.me?.email || 'کاربر مهمان' }}</span>
              </div>
            </div>
          </div>

          <!-- جداکننده نئونی -->
          <div class="neon-divider" />

          <!-- نقش‌های سیستم با استایل کریستال شناور -->
          <div class="roles-galaxy q-my-sm">
            <div class="galaxy-label">
              <q-icon
                name="verified_user"
                size="15px"
                class="label-icon" />
              مجوزها و پایگاه‌های کاربری
            </div>

            <div class="badges-stream q-mt-xs">
              <div
                v-for="role in userManager.me?.roles || []"
                :key="role.name"
                class="crystal-tag">
                <span class="tag-glow-dot" />
                <span>{{ translateRole(role.name) }}</span>
              </div>

              <div
                v-if="!userManager.me?.roles?.length"
                class="no-role-shimmer">
                فاقد رول فعال
              </div>
            </div>
          </div>

          <!-- جداکننده نئونی -->
          <div class="neon-divider" />

          <!-- دکمه‌های کنترلی سایبرپانکی -->
          <div class="quantum-actions q-mt-md">
            <button
              v-close-popup
              class="quantum-btn quantum-btn--primary"
              @click="goToProfileEdit">
              <span class="btn-flare" />
              <q-icon
                name="tune"
                size="18px"
                class="q-mr-sm" />
              <span>پیکربندی حساب</span>
            </button>

            <button
              v-close-popup
              class="quantum-btn quantum-btn--danger"
              @click="logout">
              <span class="btn-flare" />
              <q-icon
                name="logout"
                size="18px"
                class="q-mr-sm" />
              <span>خروج از مدار</span>
            </button>
          </div>
        </div>
      </q-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useUser } from 'src/stores/user'
import { userRoleOptions } from 'src/repositories/user'

const $q = useQuasar()
const router = useRouter()
const userManager = useUser()

function translateRole (roleName: string): string {
  const target = userRoleOptions.find((role) => role.value === roleName)
  return target ? target.label : '-'
}

function logout () {
  userManager.logout()
  router.push({ name: 'Auth.Login' })
}

function goToProfileEdit () {
  const userId = userManager.me?.id
  if (!userId) {
    $q.notify({
      type: 'negative',
      message: 'شناسه کاربر نامعتبر است'
    })
    return
  }

  router.push({
    name: 'Panel.User.Edit',
    params: { id: userId }
  })
}
</script>

<style scoped lang="scss">
.user-profile-wrapper {
  display: inline-flex;
  align-items: center;
}

/* ========================================================
   کپسول تریگر در هدر (Holographic Trigger)
======================================================== */
.hologram-pill-btn {
  position: relative;
  border-radius: 999px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.2));
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-2px) scale(1.02);

    .conic-spinner, .avatar-spin-ring {
      animation-play-state: running;
    }

    .arrow-icon {
      transform: rotate(180deg);
      color: #6366f1;
    }
  }

  .pill-inner-content {
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    padding: 4px 10px 4px 6px;
    border-radius: 999px;
  }

  .avatar-orbit {
    position: relative;

    .trigger-avatar {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .pulsing-live-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 9px;
      height: 9px;
      background: #10b981;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: heartbeat 2s infinite ease-in-out;
    }
  }

  .user-meta-header {
    display: flex;
    flex-direction: column;
    text-align: right;
    line-height: 1.25;

    .header-name {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
    }
    .header-subtitle {
      font-size: 10px;
      color: #10b981;
      font-weight: 600;
    }
  }

  .icon-toggle-bubble {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(241, 245, 249, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;

    .arrow-icon {
      color: #64748b;
      transition: all 0.3s ease;
    }
  }
}

/* ========================================================
   پاپ‌آپ شیشه‌ای کوانتومی (Quantum Glass Menu)
======================================================== */
.hologram-menu-shell {
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;
}

.quantum-glass-card {
  position: relative;
  width: 310px;
  padding: 22px;
  direction: rtl;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(28px) saturate(210%);
  -webkit-backdrop-filter: blur(28px) saturate(210%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

/* هاله‌های نوری آرورا (Aurora Glow) */
.aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(45px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
  animation: orb-float 8s infinite alternate ease-in-out;
}

.aurora-1 {
  width: 150px;
  height: 150px;
  background: #6366f1;
  top: -40px;
  right: -30px;
}

.aurora-2 {
  width: 140px;
  height: 140px;
  background: #ec4899;
  bottom: -30px;
  left: -20px;
  animation-delay: -3s;
}

.aurora-3 {
  width: 100px;
  height: 100px;
  background: #06b6d4;
  top: 45%;
  left: 20%;
  animation-delay: -5s;
}

@keyframes orb-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(15px, 20px) scale(1.15); }
}

/* موج رفلکس شیشه */
.card-sheen {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 42%,
    rgba(255, 255, 255, 0.35) 48%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 54%
  );
  pointer-events: none;
  transform: rotate(25deg);
  opacity: 0.7;
}

/* ========================================================
   بخش هدر منو با آواتار رینگی
======================================================== */
.profile-hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-spin-ring {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  .conic-spinner {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #6366f1, #ec4899, #06b6d4, #6366f1);
    animation: spin 5s linear infinite;
    opacity: 0.9;
    filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.4));
  }

  .avatar-core {
    position: relative;
    z-index: 2;
    background: #ffffff;
  }

  .vip-sparkle {
    position: absolute;
    bottom: 2px;
    right: 2px;
    z-index: 3;
    background: linear-gradient(135deg, #1e293b, #0f172a);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.hero-texts {
  min-width: 0;
  flex: 1;

  .user-big-name {
    font-size: 16px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1.35;
    letter-spacing: -0.3px;
  }

  .user-badge-id {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    padding: 3px 10px;
    border-radius: 8px;
    background: rgba(241, 245, 249, 0.85);
    font-size: 11px;
    color: #475569;
    direction: ltr;
    max-width: 170px;

    .id-symbol {
      color: #6366f1;
      font-weight: 800;
    }
  }
}

/* خط نئونی */
.neon-divider {
  position: relative;
  z-index: 1;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3), transparent);
}

/* ========================================================
   بخش رول‌های کریستالی
======================================================== */
.roles-galaxy {
  position: relative;
  z-index: 1;

  .galaxy-label {
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    display: flex;
    align-items: center;

    .label-icon {
      color: #6366f1;
      margin-left: 6px;
    }
  }

  .badges-stream {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .crystal-tag {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
    color: #312e81;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(199, 210, 254, 0.8);
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.08);
    backdrop-filter: blur(8px);
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-1px) scale(1.04);
      border-color: #6366f1;
    }

    .tag-glow-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6366f1;
      margin-left: 6px;
      box-shadow: 0 0 6px #6366f1;
    }
  }

  .no-role-shimmer {
    font-size: 11px;
    color: #94a3b8;
    padding: 4px;
  }
}

/* ========================================================
   دکمه‌های کوانتومی با افکت درخشش هاور
======================================================== */
.quantum-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantum-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .btn-flare {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: skewX(-20deg);
    transition: all 0.5s ease;
  }

  &:hover .btn-flare {
    left: 140%;
  }

  &--primary {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(79, 70, 229, 0.5);
    }
  }

  &--danger {
    background: rgba(254, 242, 242, 0.85);
    color: #ef4444;
    border: 1px solid rgba(254, 202, 202, 0.9);

    &:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.15);
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); box-shadow: 0 0 12px #10b981; }
}

:global(.q-menu) {
  background: transparent;
  box-shadow: none;
}
</style>
