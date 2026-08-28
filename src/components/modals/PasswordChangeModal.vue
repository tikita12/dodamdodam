<script setup lang="ts">
import { ref } from 'vue'
import { useSessionStore } from '@/stores/session'
import { changeVolunteerPassword } from '@/services/volunteerService'
import { KeyRound, Lock, X, Loader2, CheckCircle2, AlertCircle } from '@lucide/vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const sessionStore = useSessionStore()

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!sessionStore.volunteerId) {
    errorMessage.value = '로그인 세션 정보가 없습니다. 다시 로그인해주세요.'
    return
  }

  const oldPw = currentPassword.value.trim()
  const newPw = newPassword.value.trim()
  const confirmPw = newPasswordConfirm.value.trim()

  if (!oldPw) {
    errorMessage.value = '현재 비밀번호를 입력해주세요.'
    return
  }
  if (!newPw || newPw.length < 4) {
    errorMessage.value = '새 비밀번호는 4자리 이상으로 설정해주세요.'
    return
  }
  if (newPw !== confirmPw) {
    errorMessage.value = '새 비밀번호 확인이 일치하지 않습니다.'
    return
  }
  if (oldPw === newPw) {
    errorMessage.value = '새 비밀번호가 현재 비밀번호와 동일합니다.'
    return
  }

  isLoading.value = true
  try {
    await changeVolunteerPassword(
      sessionStore.volunteerId,
      oldPw,
      newPw
    )
    successMessage.value = '🎉 비밀번호가 성공적으로 변경되었습니다!'
    currentPassword.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''
    setTimeout(() => {
      emit('close')
      successMessage.value = ''
    }, 1500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '비밀번호 변경 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      <div class="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 my-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <KeyRound class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 leading-tight">비밀번호 변경</h3>
              <p class="text-[11px] text-slate-400 font-medium">
                {{ sessionStore.volunteerName }} 님의 새 비밀번호 설정
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Feedback Alerts -->
        <div
          v-if="errorMessage"
          class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <div
          v-if="successMessage"
          class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Lock class="w-3.5 h-3.5 text-slate-400" />
              <span>현재 비밀번호</span>
            </label>
            <input
              v-model="currentPassword"
              type="password"
              required
              placeholder="현재 비밀번호 입력"
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <KeyRound class="w-3.5 h-3.5 text-slate-400" />
              <span>새 비밀번호 (4자리 이상)</span>
            </label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="4"
              placeholder="새 비밀번호 입력"
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Lock class="w-3.5 h-3.5 text-slate-400" />
              <span>새 비밀번호 확인</span>
            </label>
            <input
              v-model="newPasswordConfirm"
              type="password"
              required
              minlength="4"
              placeholder="새 비밀번호 다시 입력"
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <!-- Buttons -->
          <div class="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="emit('close')"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
              <span v-else>변경 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
