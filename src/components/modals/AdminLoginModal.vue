<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { loginAdminWithEmail, sendPasswordResetForAdmin } from '@/services/adminAuthService'
import { Shield, X, Lock, Mail, Loader2, AlertCircle, Info, CheckCircle2, KeyRound } from '@lucide/vue'

const router = useRouter()
const sessionStore = useSessionStore()

const email = ref('cwacc@hanmail.net')
const password = ref('')
const isLoading = ref(false)
const isResetLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const user = await loginAdminWithEmail(email.value, password.value)
    sessionStore.setAdminUser(user)
    sessionStore.closeAdminLoginModal()
    router.push('/admin')
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password')) {
        errorMessage.value = '비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
      } else if (err.message.includes('auth/user-not-found')) {
        errorMessage.value = 'Firebase 콘솔에 등록되지 않은 관리자 계정입니다.'
      } else {
        errorMessage.value = err.message
      }
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleForgotPassword() {
  errorMessage.value = ''
  successMessage.value = ''
  isResetLoading.value = true

  try {
    await sendPasswordResetForAdmin(email.value)
    successMessage.value = `${email.value} 메일함으로 비밀번호 재설정 링크가 발송되었습니다! 메일을 확인해주세요.`
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = '비밀번호 재설정 이메일 발송에 실패했습니다.'
    }
  } finally {
    isResetLoading.value = false
  }
}

function handleClose() {
  errorMessage.value = ''
  successMessage.value = ''
  password.value = ''
  sessionStore.closeAdminLoginModal()
}
</script>

<template>
  <div
    v-if="sessionStore.isAdminLoginModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs transition-opacity"
  >
    <div class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
            <Shield class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 leading-tight">관리자 로그인</h3>
            <p class="text-[11px] text-slate-400">지정된 관리자 전용 계정</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="mt-4 space-y-3.5">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2"
        >
          <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span class="font-medium leading-relaxed">{{ errorMessage }}</span>
        </div>

        <!-- Success Alert -->
        <div
          v-if="successMessage"
          class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span class="font-semibold leading-relaxed">{{ successMessage }}</span>
        </div>

        <!-- Info Hint -->
        <div class="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
          <Info class="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>관리자 계정: <strong>cwacc@hanmail.net</strong> 또는 <strong>admin2@dodam.com</strong></span>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">관리자 이메일</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="cwacc@hanmail.net 또는 admin2@dodam.com"
              class="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>
          <div class="flex gap-1.5 mt-1.5">
            <button
              type="button"
              @click="email = 'cwacc@hanmail.net'"
              class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition cursor-pointer"
            >
              cwacc@hanmail.net
            </button>
            <button
              type="button"
              @click="email = 'admin2@dodam.com'"
              class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition cursor-pointer"
            >
              admin2@dodam.com
            </button>
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-slate-700">비밀번호</label>
            <button
              type="button"
              @click="handleForgotPassword"
              :disabled="isResetLoading"
              class="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline transition flex items-center gap-1 cursor-pointer"
            >
              <KeyRound class="w-3 h-3" />
              <span>{{ isResetLoading ? '메일 발송 중...' : '비밀번호 재설정 메일 발송' }}</span>
            </button>
          </div>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="Firebase에 등록한 관리자 비밀번호 입력"
              class="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>
        </div>

        <!-- Action Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 text-xs transition active:scale-98 cursor-pointer"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <span v-else>관리자 대시보드 입장</span>
        </button>
      </form>
    </div>
  </div>
</template>
