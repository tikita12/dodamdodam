<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { applyScheduleTransaction, cancelScheduleTransaction } from '@/services/applicationService'
import type { Schedule, VolunteerResponse } from '@/types'
import { computeScheduleStatus } from '@/utils/status'
import { Check, X, Loader2, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  schedule: Schedule
  responses: VolunteerResponse[]
}>()

const sessionStore = useSessionStore()
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 현재 세션의 봉사자가 이 일정에 신청했는지 여부
const isUserApplied = computed(() => {
  if (!sessionStore.volunteerId) return false
  return props.responses.some((r) => r.volunteerId === sessionStore.volunteerId)
})

const statusInfo = computed(() => computeScheduleStatus(props.schedule))

async function handleApply() {
  if (!sessionStore.volunteerId || !sessionStore.volunteerName) {
    sessionStore.openVolunteerModal()
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    await applyScheduleTransaction(
      props.schedule.id,
      sessionStore.volunteerId,
      sessionStore.volunteerName
    )
    successMessage.value = '참여 신청이 성공적으로 완료되었습니다!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = '신청 처리 중 오류가 발생했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleCancel() {
  if (!sessionStore.volunteerId) return

  if (!confirm('정말로 참여 신청을 취소하시겠습니까?')) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    await cancelScheduleTransaction(props.schedule.id, sessionStore.volunteerId)
    successMessage.value = '신청이 취소되었습니다.'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = '취소 처리 중 오류가 발생했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 max-w-md mx-auto">
    <!-- Success or Error Feedback Toast -->
    <div
      v-if="errorMessage"
      class="mb-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center justify-between animate-in fade-in"
    >
      <div class="flex items-center gap-1.5">
        <AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>
      <button type="button" @click="errorMessage = ''" class="text-slate-400 hover:text-slate-600">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <div
      v-if="successMessage"
      class="mb-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in"
    >
      <div class="flex items-center gap-1.5">
        <Check class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{{ successMessage }}</span>
      </div>
      <button type="button" @click="successMessage = ''" class="text-slate-400 hover:text-slate-600">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- 1. 본인이 이미 신청한 상태인 경우 (취소 액션) -->
    <template v-if="isUserApplied">
      <div class="space-y-1.5">
        <button
          type="button"
          @click="handleCancel"
          :disabled="isLoading || statusInfo.status === 'confirmed' || statusInfo.status === 'ended' || statusInfo.status === 'cancelled'"
          class="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs transition active:scale-98 cursor-pointer"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <template v-else>
            <X class="w-4 h-4" />
            <span>신청 취소하기</span>
          </template>
        </button>
        <p class="text-[10px] text-center text-slate-400">
          관리자가 확정하기 전까지는 언제든 자유롭게 취소할 수 있습니다.
        </p>
      </div>
    </template>

    <!-- 2. 본인이 아직 신청하지 않은 상태인 경우 -->
    <template v-else>
      <!-- 2-1: 신청 가능 상태 (open) -->
      <button
        v-if="statusInfo.status === 'open'"
        type="button"
        @click="handleApply"
        :disabled="isLoading"
        class="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm transition active:scale-98 cursor-pointer"
      >
        <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
        <template v-else>
          <Check class="w-4 h-4" />
          <span>봉사 참여 신청하기</span>
        </template>
      </button>

      <!-- 2-2: 마감된 상태 (closed) -->
      <button
        v-else-if="statusInfo.status === 'closed'"
        disabled
        class="w-full py-3.5 px-4 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold rounded-2xl text-xs flex items-center justify-center cursor-not-allowed opacity-80"
      >
        모집 정원이 마감되었습니다
      </button>

      <!-- 2-3: 확정 완료 상태 (confirmed) -->
      <button
        v-else-if="statusInfo.status === 'confirmed'"
        disabled
        class="w-full py-3.5 px-4 bg-blue-50 text-blue-700 border border-blue-200 font-extrabold rounded-2xl text-xs flex items-center justify-center cursor-not-allowed opacity-80"
      >
        참여 확정된 일정입니다 (신청 마감)
      </button>

      <!-- 2-4: 진행중 또는 종료 상태 (in_progress, ended) -->
      <button
        v-else-if="statusInfo.status === 'ended' || statusInfo.status === 'in_progress'"
        disabled
        class="w-full py-3.5 px-4 bg-slate-100 text-slate-500 font-extrabold rounded-2xl text-xs flex items-center justify-center cursor-not-allowed"
      >
        {{ statusInfo.status === 'in_progress' ? '현재 봉사 활동 진행 중입니다' : '종료된 봉사 일정입니다' }}
      </button>

      <!-- 2-5: 취소된 상태 (cancelled) -->
      <button
        v-else
        disabled
        class="w-full py-3.5 px-4 bg-slate-100 text-slate-400 font-extrabold rounded-2xl text-xs flex items-center justify-center cursor-not-allowed"
      >
        취소된 일정입니다
      </button>
    </template>
  </div>
</template>
