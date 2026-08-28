<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  subscribeVolunteers,
  subscribePendingVolunteers,
  addVolunteer,
  removeVolunteer,
  approveVolunteer,
  rejectVolunteer,
  resetVolunteerPasswordByAdmin,
} from '@/services/volunteerService'
import type { Volunteer } from '@/types'
import { toDayjs } from '@/utils/datetime'
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Check,
  X,
  UserCheck,
  BellRing,
  KeyRound,
} from '@lucide/vue'

// 활성 탭 ('pending' | 'approved')
const activeTab = ref<'pending' | 'approved'>('pending')

const approvedVolunteers = ref<Volunteer[]>([])
const pendingVolunteers = ref<Volunteer[]>([])
const newVolunteerName = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

let unsubscribeApproved: (() => void) | null = null
let unsubscribePending: (() => void) | null = null

onMounted(() => {
  unsubscribeApproved = subscribeVolunteers((list) => {
    approvedVolunteers.value = list
    isLoading.value = false
  })

  unsubscribePending = subscribePendingVolunteers((list) => {
    pendingVolunteers.value = list
    // 대기자가 있으면 기본 탭을 대기 탭으로, 없으면 승인 목록 탭으로
    if (list.length === 0 && activeTab.value === 'pending' && approvedVolunteers.value.length > 0) {
      activeTab.value = 'approved'
    }
  })
})

onUnmounted(() => {
  if (unsubscribeApproved) unsubscribeApproved()
  if (unsubscribePending) unsubscribePending()
})

// 관리자 직접 추가 (즉시 승인)
async function handleAdd() {
  const name = newVolunteerName.value.trim()
  if (!name) return

  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await addVolunteer(name)
    newVolunteerName.value = ''
    successMessage.value = `'${name}' 봉사자가 등록(승인)되었습니다.`
    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '봉사자 추가 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

// 승인 처리
async function handleApprove(v: Volunteer) {
  errorMessage.value = ''
  try {
    await approveVolunteer(v.id)
    successMessage.value = `🎉 '${v.name}' 봉사자가 승인되었습니다.`
    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '승인 처리 중 오류가 발생했습니다.'
  }
}

// 반려 처리
async function handleReject(v: Volunteer) {
  if (!confirm(`'${v.name}' 봉사자의 가입 신청을 반려하시겠습니까?`)) {
    return
  }

  errorMessage.value = ''
  try {
    await rejectVolunteer(v.id)
    successMessage.value = `'${v.name}' 봉사자의 신청이 반려되었습니다.`
    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '반려 처리 중 오류가 발생했습니다.'
  }
}

// 관리자: 비밀번호 재설정/초기화
async function handleResetPassword(v: Volunteer) {
  const newPw = prompt(`'${v.name}' 봉사자의 새 비밀번호를 4자리 이상 입력해주세요:`, '0000')
  if (!newPw) return

  const trimmed = newPw.trim()
  if (trimmed.length < 4) {
    alert('비밀번호는 4자리 이상이어야 합니다.')
    return
  }

  try {
    await resetVolunteerPasswordByAdmin(v.id, trimmed)
    successMessage.value = `'${v.name}' 봉사자의 비밀번호가 '${trimmed}'(으)로 재설정되었습니다.`
    setTimeout(() => {
      successMessage.value = ''
    }, 3500)
  } catch (err) {
    alert(err instanceof Error ? err.message : '비밀번호 재설정 중 오류가 발생했습니다.')
  }
}

// 삭제 처리
async function handleRemove(v: Volunteer) {
  if (!confirm(`'${v.name}' 봉사자를 명단에서 삭제하시겠습니까?`)) {
    return
  }

  try {
    await removeVolunteer(v.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div class="p-4 space-y-4 pb-20 animate-in fade-in duration-200">
    
    <!-- Title Header -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900 tracking-tight">자원봉사자 명단 & 승인 관리</h2>
          <p class="text-xs text-slate-400">
            승인 {{ approvedVolunteers.length }}명 · 대기 {{ pendingVolunteers.length }}명
          </p>
        </div>
      </div>
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

    <!-- Main Navigation Tabs -->
    <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
      <button
        type="button"
        @click="activeTab = 'pending'"
        :class="[
          'py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 relative',
          activeTab === 'pending'
            ? 'bg-white text-amber-700 shadow-xs'
            : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        <BellRing class="w-3.5 h-3.5" />
        <span>가입 승인 대기</span>
        <span
          v-if="pendingVolunteers.length > 0"
          class="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold"
        >
          {{ pendingVolunteers.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'approved'"
        :class="[
          'py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5',
          activeTab === 'approved'
            ? 'bg-white text-emerald-700 shadow-xs'
            : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        <UserCheck class="w-3.5 h-3.5" />
        <span>활동 중인 봉사자</span>
        <span class="text-[10px] font-bold text-slate-400">({{ approvedVolunteers.length }})</span>
      </button>
    </div>

    <!-- ==================== TAB 1: PENDING APPROVAL LIST ==================== -->
    <div v-if="activeTab === 'pending'" class="space-y-3">
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 class="text-xs font-extrabold text-slate-800 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-amber-500" />
            <span>승인 대기 신청자 목록</span>
          </span>
          <span class="text-amber-600 font-bold text-xs">{{ pendingVolunteers.length }}명 대기 중</span>
        </h3>

        <div v-if="pendingVolunteers.length === 0" class="py-12 text-center text-slate-400 text-xs space-y-1">
          <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto mb-1 stroke-1" />
          <p class="font-bold text-slate-600">승인 대기 중인 신청자가 없습니다.</p>
          <p class="text-[11px] text-slate-400">새로운 봉사자가 가입 신청하면 여기에 표시됩니다.</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="v in pendingVolunteers"
            :key="v.id"
            class="p-4 bg-amber-50/50 hover:bg-amber-50 border border-amber-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
          >
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-black text-sm text-slate-900">{{ v.name }}</span>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                  승인 대기
                </span>
              </div>
              <p class="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Clock class="w-3 h-3 text-slate-400" />
                <span>신청일시: {{ toDayjs(v.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
              </p>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                @click="handleReject(v)"
                class="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <X class="w-3.5 h-3.5" />
                <span>반려</span>
              </button>
              <button
                type="button"
                @click="handleApprove(v)"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Check class="w-3.5 h-3.5" />
                <span>승인하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: APPROVED VOLUNTEERS ==================== -->
    <div v-else class="space-y-4">
      
      <!-- Direct Add Form -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 class="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <UserPlus class="w-3.5 h-3.5 text-emerald-600" />
          <span>새 봉사자 직접 추가 (즉시 승인)</span>
        </h3>

        <form @submit.prevent="handleAdd" class="flex items-center gap-2 w-full">
          <input
            v-model="newVolunteerName"
            type="text"
            required
            placeholder="봉사자 실명 입력 (예: 홍길동)"
            class="flex-1 min-w-0 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            :disabled="isSubmitting || !newVolunteerName.trim()"
            class="shrink-0 px-4 sm:px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span v-else>추가</span>
          </button>
        </form>
      </div>

      <!-- Approved List -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <h3 class="text-xs font-extrabold text-slate-800 flex items-center justify-between">
          <span>등록된 봉사자 명단</span>
          <span class="text-slate-400 font-normal">{{ approvedVolunteers.length }}명</span>
        </h3>

        <div v-if="isLoading" class="py-8 text-center text-slate-400 text-xs">
          <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <span>명단을 불러오는 중...</span>
        </div>

        <div v-else-if="approvedVolunteers.length === 0" class="py-8 text-center text-xs text-slate-400">
          등록된 자원봉사자가 없습니다.
        </div>

        <div v-else class="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="v in approvedVolunteers"
            :key="v.id"
            class="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 transition"
          >
            <div class="flex items-center gap-2">
              <span>{{ v.name }}</span>
              <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">활동중</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="handleResetPassword(v)"
                class="px-2.5 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
                title="비밀번호 초기화 / 임시 비밀번호 설정"
              >
                <KeyRound class="w-3 h-3 text-amber-500" />
                <span>비번 재설정</span>
              </button>

              <button
                type="button"
                @click="handleRemove(v)"
                class="w-7 h-7 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
                title="봉사자 삭제"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
