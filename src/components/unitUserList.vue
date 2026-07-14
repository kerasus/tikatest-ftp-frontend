<script setup lang="ts">
// import { useQuasar } from 'quasar';
// import { useUser } from 'src/stores/user';
// import { defineEmits, ref, type Ref } from 'vue';
// import { type UserType  } from 'src/repositories/user';
// import Confirmation from 'components/cards/confirmation.vue';
// import DeleteBtn from 'src/components/controls/deleteBtn.vue';
// import UnitAPI, { getUnitUserFullname } from 'src/repositories/unit';
//
// const props = defineProps<{
//   unitId: number,
//   editMode: boolean,
//   users: UserType[],
//   userRole: 'resident' | 'owner'
// }>()
//
// const emits = defineEmits(['change']);
//
// type ConfirmationType = 'auth' | 'debt-owner' | 'debt-resident'
//
// const $q = useQuasar();
// const userManager = useUser();
// const unitAPI = new UnitAPI();
//
// let confirmationType: ConfirmationType = 'auth';
// const sendSMSLoading = ref(false);
// const showSMSDialog = ref(false);
// const confirmationMessage: Ref<string | null> = ref(null);
// const selectedUserToSendSMS = ref<number | null>(null);
// const loading = ref(false);
// const inputUserId = ref(null);
//
// async function detachUser(user: UserType) {
//   try {
//     loading.value = true;
//     if (user.id) {
//       await unitAPI.detachUser(props.unitId, user.id)
//     }
//   } finally {
//     loading.value = false;
//     emits('change')
//   }
// }
//
// async function attachUser() {
//   if (!inputUserId.value) {
//     return
//   }
//
//   try {
//     loading.value = true;
//     await unitAPI.attachUser(props.unitId, { user_id: inputUserId.value, role: props.userRole})
//   } finally {
//     loading.value = false;
//     emits('change')
//   }
// }
//
// function callResidentPhoneNumber(phoneNumber: string) {
//   const telUrl = `tel:${phoneNumber}`;
//
//   // Check if the device supports the tel protocol
//   if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//     window.location.href = telUrl;
//   } else {
//     // Show an error message if the device does not support phone calls
//
//     $q.notify({
//       classes: 'snack--negative snack--inline-action',
//       icon: 'info',
//       message: 'دستگاه شما از تماس تلفنی پشتیبانی نمی‌کند.',
//       timeout: 20000,
//       actions: [
//         {
//           icon: 'close',
//           class: 'icon-button',
//           handler: () => {
//             /* ... */
//           },
//         },
//       ],
//     });
//   }
// }
//
// function sendSMSConfirmation(userId: number, type: ConfirmationType) {
//   setConfirmationMessage(type)
//   confirmationType = type
//   showSMSDialog.value = true
//   selectedUserToSendSMS.value = userId;
// }
//
// function hideDialog() {
//   showSMSDialog.value = false;
// }
//
// function onsubmitSendSMS() {
//   hideDialog()
//   if (!selectedUserToSendSMS.value) {
//     return
//   }
//
//   if (confirmationType === 'auth') {
//     sendAuthSMS(props.unitId, selectedUserToSendSMS.value)
//   } else if (confirmationType === 'debt-owner' || confirmationType === 'debt-resident') {
//     sendDebtSMS(props.unitId)
//   }
// }
//
// function sendDebtSMS (unitId: number) {
//   sendSMSLoading.value = true;
//   const targetGroup = confirmationType === 'debt-owner' ? 'owner' : 'resident';
//   unitAPI.sendDebtSMS(unitId, targetGroup)
//     .then(() => {
//       $q.notify({
//         message: 'پیامک با موفقیت ارسال شد.',
//         type: 'positive'
//       })
//     })
//     .finally(()=>{
//       sendSMSLoading.value = false
//     })
// }
//
// function sendAuthSMS (unitId: number, userId: number) {
//   sendSMSLoading.value = true;
//   unitAPI.sendLoginInfo(unitId, userId)
//     .then(() => {
//       $q.notify({
//         message: 'پیامک با موفقیت ارسال شد.',
//         type: 'positive'
//       })
//     })
//     .finally(()=>{
//       sendSMSLoading.value = false
//     })
// }
//
// function setConfirmationMessage (type: ConfirmationType) {
//   if (type === 'auth') {
//     confirmationMessage.value =  'از ارسال پیامک اطلاعات ورود به سامانه اطمینان دارید؟'
//   } else if (type === 'debt-owner') {
//     confirmationMessage.value =  'از ارسال پیامک اطلاع رسانی بدهی مالک اطمینان دارید؟'
//   } else if (type === 'debt-resident') {
//     confirmationMessage.value =  'از ارسال پیامک اطلاع رسانی بدهی ساکن اطمینان دارید؟'
//   }
// }
</script>

<template>
  ss
<!--  <q-list bordered separator class="unit-user-list">-->
<!--    <q-item>-->
<!--      <q-item-section>-->
<!--        <q-item-label>-->
<!--          <span v-if="userRole === 'resident'">-->
<!--            ساکنین-->
<!--          </span>-->
<!--          <span v-else-if="userRole === 'owner'">-->
<!--            مالکین-->
<!--          </span>-->
<!--        </q-item-label>-->
<!--      </q-item-section>-->
<!--      <q-item-section v-if="userManager.isManager && editMode"-->
<!--                      side>-->
<!--        <div>-->
<!--          <q-input v-model="inputUserId"-->
<!--                   :loading="loading"-->
<!--                    label="user_id">-->
<!--            <template #after>-->
<!--              <q-btn v-if="userManager.isManager"-->
<!--                     color="primary"-->
<!--                     flat-->
<!--                     icon="add"-->
<!--                     :loading="loading"-->
<!--                     @click="attachUser"-->
<!--              />-->
<!--            </template>-->
<!--          </q-input>-->
<!--        </div>-->
<!--      </q-item-section>-->
<!--    </q-item>-->
<!--    <q-linear-progress v-if="loading"-->
<!--                       indeterminate />-->
<!--    <template v-else>-->
<!--      <q-item v-for="(user, userIndex) in users"-->
<!--              :key="userIndex"-->
<!--              v-ripple-->
<!--              clickable-->
<!--              class="unit-user-item"-->
<!--      >-->
<!--        <q-item-section avatar-->
<!--                        class="gt-md">-->
<!--          <q-icon name="account_circle" />-->
<!--        </q-item-section>-->
<!--        <q-item-section class="user-info-section">-->
<!--          <q-item-label>{{ getUnitUserFullname(user) }}</q-item-label>-->
<!--          <q-item-label caption>-->
<!--            {{ user.mobile }}-->
<!--          </q-item-label>-->
<!--        </q-item-section>-->
<!--        <q-item-section v-if="userManager.isManager"-->
<!--                        side>-->
<!--          <div class="actions-on-user text-grey-8">-->
<!--            <template v-if="!editMode">-->
<!--              <q-btn v-if="user.mobile"-->
<!--                     flat-->
<!--                     color="grey"-->
<!--                     icon="call"-->
<!--                     class="btn-call-user"-->
<!--                     @click="callResidentPhoneNumber(user.mobile)"  />-->
<!--              <q-btn v-if="userManager.isManager && user.id"-->
<!--                     flat-->
<!--                     round-->
<!--                     color="grey"-->
<!--                     icon="img:/panel/images/icons/sms-auth.png"-->
<!--                     @click="sendSMSConfirmation(user.id ,'auth')"/>-->
<!--              <q-btn v-if="userManager.isManager && user.id"-->
<!--                     flat-->
<!--                     round-->
<!--                     color="grey"-->
<!--                     icon="img:/panel/images/icons/sms-debt.png"-->
<!--                     @click="sendSMSConfirmation(user.id, userRole === 'resident' ? 'debt-resident' : 'debt-owner')"/>-->
<!--              <q-btn v-if="userManager.isManager"-->
<!--                     flat-->
<!--                     round-->
<!--                     icon="visibility"-->
<!--                     color="grey"-->
<!--                     :to="{ name: 'Panel.User.Show', params: {id: user.id}}"-->
<!--              />-->
<!--            </template>-->

<!--            <delete-btn v-if="userManager.isManager && editMode"-->
<!--                        :row="user"-->
<!--                        :loading="loading"-->
<!--                        :change-status-promise="detachUser"-->
<!--                        :use-flag="false"-->
<!--            />-->
<!--          </div>-->
<!--        </q-item-section>-->
<!--      </q-item>-->
<!--    </template>-->
<!--  </q-list>-->
<!--  <q-dialog v-model="showSMSDialog" :persistent="sendSMSLoading">-->
<!--    <confirmation v-if="confirmationMessage"-->
<!--      title="توجه"-->
<!--      :message="confirmationMessage"-->
<!--      submit-label="بله"-->
<!--      cancel-label="انصراف"-->
<!--      icon="feedback"-->
<!--      title-color="warning"-->
<!--      :loading="sendSMSLoading"-->
<!--      @submit="onsubmitSendSMS"-->
<!--      @cancel="hideDialog"-->
<!--    />-->
<!--  </q-dialog>-->
</template>

<style scoped lang="scss">
.unit-user-list {
  .unit-user-item {
    .user-info-section {
      min-width: 200px;
    }
    .actions-on-user {
      :deep(.q-btn) {

      }
      .btn-call-user {
        padding: $space-1 $space-2;
      }
    }
    @media screen and (width < 1024px) {
      .actions-on-user {
        display: flex;
        flex-wrap: wrap;
      }
    }
    @media screen and (width < 700px) {
      .user-info-section {
        min-width: 100px;
      }
    }
  }
}
</style>
