<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { registerVolunteer, loginVolunteer } from '@/services/volunteerService'
import {
  HeartHandshake,
  Sparkles,
  UserCheck,
  UserPlus,
  Lock,
  ArrowRight,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  KeyRound,
  X,
  LogOut,
} from '@lucide/vue'

const router = useRouter()
const sessionStore = useSessionStore()

// 활성 탭 ('login' | 'register')
const activeTab = ref<'login' | 'register'>('login')

// 비밀번호 분실 안내 모달 상태
const showForgotModal = ref(false)

// 로그인 폼 상태 (직접 타이핑 입력)
const loginName = ref('')
const loginPassword = ref('')
const isLoggingIn = ref(false)
const loginError = ref('')

// 로그인 처리
async function handleLogin() {
  loginError.value = ''
  const trimmedName = loginName.value.trim()
  const trimmedPw = loginPassword.value.trim()

  if (!trimmedName) {
    loginError.value = '이름을 입력해주세요.'
    return
  }
  if (!trimmedPw) {
    loginError.value = '비밀번호를 입력해주세요.'
    return
  }

  isLoggingIn.value = true
  try {
    const vol = await loginVolunteer(trimmedName, trimmedPw)
    sessionStore.setVolunteer(vol.id, vol.name)
    router.push('/main')
  } catch (err) {
    loginError.value = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.'
  } finally {
    isLoggingIn.value = false
  }
}

// 가입 신청 폼 상태
const regName = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')
const isRegistering = ref(false)
const regError = ref('')
const regSuccess = ref(false)

// 신규 등록 신청 처리
async function handleRegister() {
  regError.value = ''
  regSuccess.value = false

  const name = regName.value.trim()
  const pw = regPassword.value.trim()
  const pwConfirm = regPasswordConfirm.value.trim()

  if (!name) {
    regError.value = '실명을 입력해주세요.'
    return
  }
  if (!pw || pw.length < 4) {
    regError.value = '비밀번호는 4자리 이상으로 설정해주세요.'
    return
  }
  if (pw !== pwConfirm) {
    regError.value = '비밀번호가 일치하지 않습니다. 다시 확인해주세요.'
    return
  }

  isRegistering.value = true
  try {
    await registerVolunteer(name, pw)
    regSuccess.value = true
    regName.value = ''
    regPassword.value = ''
    regPasswordConfirm.value = ''
  } catch (err) {
    regError.value = err instanceof Error ? err.message : '등록 신청 중 오류가 발생했습니다.'
  } finally {
    isRegistering.value = false
  }
}

function handleContinueAsCurrent() {
  router.push('/main')
}

function handleSwitchAccount() {
  sessionStore.clearVolunteer()
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-between bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 p-4 sm:p-6 min-h-[calc(100vh-60px)] min-h-[calc(100dvh-60px)]">
    <!-- Main Center Hero & Forms -->
    <div class="flex-1 flex flex-col justify-center items-center text-center my-auto py-4 max-w-sm mx-auto w-full">
      
      <!-- Brand Mascot Badge -->
      <div class="relative mb-3">
        <div class="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-500/25">
          <HeartHandshake class="w-8 h-8 sm:w-9 sm:h-9" />
        </div>
        <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-amber-900 text-xs shadow-sm">
          <Sparkles class="w-3 h-3 fill-amber-900" />
        </div>
      </div>

      <!-- Title & Description -->
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">도담도담</h2>
      <p class="text-xs font-bold text-emerald-700 mt-0.5">자원봉사 일정관리 시스템</p>

      <!-- Already Logged In Quick Action Banner -->
      <div
        v-if="sessionStore.isVolunteerLoggedIn"
        class="w-full mt-4 p-4 bg-emerald-50 border border-emerald-200/90 rounded-3xl shadow-xs text-left space-y-2.5 animate-in fade-in"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-600">현재 로그인 계정</span>
          <span class="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-black">
            {{ sessionStore.volunteerName }} 님
          </span>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            @click="handleContinueAsCurrent"
            class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            <span>봉사 일정 바로가기</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            @click="handleSwitchAccount"
            class="px-3 py-2.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="다른 계정으로 로그인"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      <!-- Main Auth Card -->
      <div class="w-full mt-4 bg-white p-5 rounded-3xl shadow-sm border border-emerald-100/90 text-left space-y-4">
        
        <!-- Tab Selector: Login vs Register -->
        <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            @click="activeTab = 'login'; loginError = ''; regError = ''"
            :class="[
              'py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5',
              activeTab === 'login'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            <UserCheck class="w-3.5 h-3.5" />
            <span>봉사자 로그인</span>
          </button>
          <button
            type="button"
            @click="activeTab = 'register'; loginError = ''; regError = ''"
            :class="[
              'py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5',
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>신규 등록 신청</span>
          </button>
        </div>

        <!-- ==================== TAB 1: LOGIN ==================== -->
        <div v-if="activeTab === 'login'" class="space-y-3.5 animate-in fade-in duration-150">
          <div class="text-center pb-1">
            <p class="text-xs text-slate-500">
              등록된 <span class="font-bold text-slate-800">이름과 비밀번호</span>로 입장하세요
            </p>
          </div>

          <!-- Error Alert -->
          <div
            v-if="loginError"
            class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-start gap-2"
          >
            <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span class="leading-relaxed">{{ loginError }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-3">
            <!-- Name Input (직접 타이핑) -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck class="w-3.5 h-3.5 text-slate-400" />
                <span>자원봉사자 이름</span>
              </label>
              <input
                v-model="loginName"
                type="text"
                required
                placeholder="본인 실명 입력 (예: 홍길동)"
                class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <!-- Password Input -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Lock class="w-3.5 h-3.5 text-slate-400" />
                  <span>비밀번호</span>
                </label>
                <button
                  type="button"
                  @click="showForgotModal = true"
                  class="text-[11px] font-bold text-slate-400 hover:text-emerald-700 hover:underline transition cursor-pointer"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
              <input
                v-model="loginPassword"
                type="password"
                required
                placeholder="비밀번호 입력"
                class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoggingIn"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer mt-2"
            >
              <Loader2 v-if="isLoggingIn" class="w-4 h-4 animate-spin" />
              <template v-else>
                <span>자원봉사자 일정 입장하기</span>
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </form>

          <div class="text-center pt-1">
            <button
              type="button"
              @click="activeTab = 'register'; loginError = ''"
              class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer"
            >
              처음 방문하셨나요? 봉사자 등록 신청하기 →
            </button>
          </div>
        </div>

        <!-- ==================== TAB 2: REGISTER (PENDING) ==================== -->
        <div v-else class="space-y-3.5 animate-in fade-in duration-150">
          <div class="text-center pb-1">
            <p class="text-xs text-slate-500">
              정보를 입력하시면 <span class="font-bold text-emerald-700">관리자 승인 후</span> 활동하실 수 있습니다
            </p>
          </div>

          <!-- Success Alert -->
          <div
            v-if="regSuccess"
            class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2"
          >
            <div class="flex items-center gap-2 font-black text-emerald-800 text-sm">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span>가입 신청이 완료되었습니다!</span>
            </div>
            <p class="text-[11px] text-emerald-700 leading-relaxed font-medium">
              관리자가 신원 확인 후 승인하면, 설정하신 이름과 비밀번호로 즉시 로그인하여 봉사 활동에 참여하실 수 있습니다.
            </p>
            <button
              type="button"
              @click="activeTab = 'login'; regSuccess = false"
              class="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold transition hover:bg-emerald-700 cursor-pointer"
            >
              로그인 화면으로 이동
            </button>
          </div>

          <!-- Error Alert -->
          <div
            v-if="regError"
            class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-start gap-2"
          >
            <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span class="leading-relaxed">{{ regError }}</span>
          </div>

          <form v-if="!regSuccess" @submit.prevent="handleRegister" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserPlus class="w-3.5 h-3.5 text-slate-400" />
                <span>봉사자 실명 <strong class="text-rose-500">*</strong></span>
              </label>
              <input
                v-model="regName"
                type="text"
                required
                placeholder="본인 실명 입력"
                class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <KeyRound class="w-3.5 h-3.5 text-slate-400" />
                <span>비밀번호 (4자리 이상) <strong class="text-rose-500">*</strong></span>
              </label>
              <input
                v-model="regPassword"
                type="password"
                required
                minlength="4"
                placeholder="비밀번호 설정"
                class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock class="w-3.5 h-3.5 text-slate-400" />
                <span>비밀번호 확인 <strong class="text-rose-500">*</strong></span>
              </label>
              <input
                v-model="regPasswordConfirm"
                type="password"
                required
                minlength="4"
                placeholder="비밀번호 다시 입력"
                class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              :disabled="isRegistering"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer mt-2"
            >
              <Loader2 v-if="isRegistering" class="w-4 h-4 animate-spin" />
              <template v-else>
                <span>봉사자 가입 신청하기</span>
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </form>
        </div>

      </div>

      <!-- Divider -->
      <div class="w-full flex items-center gap-3 my-4">
        <div class="flex-1 h-px bg-slate-200/80"></div>
        <span class="text-[11px] font-bold text-slate-400">또는</span>
        <div class="flex-1 h-px bg-slate-200/80"></div>
      </div>

      <!-- Admin Section -->
      <div class="w-full bg-white p-4 rounded-3xl shadow-sm border border-amber-100/80 text-left space-y-2.5">
        <div class="flex items-center gap-1.5 px-1">
          <Shield class="w-3.5 h-3.5 text-amber-500" />
          <span class="text-xs font-extrabold text-slate-700">관리자 전용</span>
        </div>

        <button
          type="button"
          @click="sessionStore.openAdminLoginModal"
          class="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold rounded-2xl shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <Shield class="w-4 h-4" />
          <span>관리자 대시보드 로그인</span>
        </button>
      </div>

    </div>

    <!-- Bottom Footer: Developer Contact -->
    <div class="text-center py-3 border-t border-slate-200/60 mt-auto">
      <div class="text-[11px] text-slate-400 font-medium">
        <span>개발자 문의: </span>
        <a
          href="mailto:bshine530@gmail.com"
          class="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-2 transition inline-flex items-center gap-1 cursor-pointer"
          title="개발자에게 이메일 보내기"
        >
          <Mail class="w-3 h-3 inline" />
          <span>bshine530@gmail.com</span>
        </a>
      </div>
    </div>

    <!-- Forgot Password Info Modal -->
    <div
      v-if="showForgotModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      <div class="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col space-y-3.5 text-left">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <KeyRound class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 leading-tight">비밀번호를 분실하셨나요?</h3>
              <p class="text-[11px] text-slate-400">비밀번호 재설정 안내</p>
            </div>
          </div>
          <button
            type="button"
            @click="showForgotModal = false"
            class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
          <p>
            🔒 도담도담은 보안과 신원 보호를 위해 <strong class="text-slate-800">관리자 확인 후 비밀번호 초기화</strong>를 지원하고 있습니다.
          </p>
          <p>
            담당 관리자에게 말씀해 주시면, 관리자 화면에서 <strong class="text-emerald-700">1초 만에 새 비밀번호(임시번호)로 즉시 재설정</strong>해 드립니다.
          </p>
        </div>

        <button
          type="button"
          @click="showForgotModal = false"
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition active:scale-98 cursor-pointer shadow-sm"
        >
          확인했습니다
        </button>
      </div>
    </div>
  </div>
</template>
