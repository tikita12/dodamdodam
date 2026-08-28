<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { subscribeAllSchedules } from '@/services/scheduleService'
import type { Schedule } from '@/types'
import { isWithinRecentDays, toDayjs } from '@/utils/datetime'
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import ScheduleCard from '@/components/schedule/ScheduleCard.vue'
import { Sparkles, CalendarDays, Inbox, Loader2, AlertCircle, RotateCcw } from 'lucide-vue-next'
import dayjs from 'dayjs'

const schedules = ref<Schedule[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)

let unsubscribe: (() => void) | null = null

function fetchSchedules() {
  loadError.value = null

  if (unsubscribe) unsubscribe()

  unsubscribe = subscribeAllSchedules(
    (list) => {
      schedules.value = list
      isLoading.value = false
    },
    (err) => {
      isLoading.value = false
      console.warn('[MainView] 일정 데이터 로드 알림:', err)
    }
  )
}

onMounted(() => {
  fetchSchedules()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Section 2: 최근 등록된 일정 (등록일 7일 이내 & 시작시간 전인 일정, 날짜순)
const recentSchedules = computed(() => {
  const now = dayjs()
  return schedules.value
    .filter((s) => {
      const isRecent = isWithinRecentDays(s.createdAt, 7)
      const isNotStarted = toDayjs(s.startAt).isAfter(now)
      const isNotCancelled = s.status !== 'cancelled'
      return isRecent && isNotStarted && isNotCancelled
    })
    .sort((a, b) => toDayjs(a.startAt).valueOf() - toDayjs(b.startAt).valueOf())
})

// Section 3: 신청 가능한 일정 (정원 미달 & status == 'open' & 시작시간 전인 일정, 날짜순)
const openSchedules = computed(() => {
  const now = dayjs()
  return schedules.value
    .filter((s) => {
      const isOpen = s.status === 'open'
      const hasCapacity = s.appliedCount < s.requiredCount
      const isNotStarted = toDayjs(s.startAt).isAfter(now)
      return isOpen && hasCapacity && isNotStarted
    })
    .sort((a, b) => toDayjs(a.startAt).valueOf() - toDayjs(b.startAt).valueOf())
})
</script>

<template>
  <div class="p-4 space-y-6 pb-12 animate-in fade-in duration-200">
    
    <!-- Loading State -->
    <div v-if="isLoading && schedules.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
      <Loader2 class="w-8 h-8 animate-spin text-emerald-500" />
      <p class="text-xs font-bold">일정 데이터를 불러오는 중입니다...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="loadError && schedules.length === 0"
      class="p-4 bg-rose-50 border border-rose-200 rounded-3xl text-xs text-rose-700 flex flex-col items-center gap-3 text-center my-8"
    >
      <AlertCircle class="w-8 h-8 text-rose-500" />
      <span class="font-semibold leading-relaxed">{{ loadError }}</span>
      <button
        type="button"
        @click="fetchSchedules"
        class="px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1.5 hover:bg-rose-100 transition shadow-2xs"
      >
        <RotateCcw class="w-3.5 h-3.5" /> 다시 시도
      </button>
    </div>

    <template v-else>
      <!-- Section 1: 월별 캘린더 그리드 -->
      <section>
        <CalendarGrid :schedules="schedules" />
      </section>

      <!-- Section 2: 최근 등록된 일정 -->
      <section class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Sparkles class="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            </div>
            <h3 class="text-sm font-black text-slate-900 tracking-tight">최근 등록된 일정</h3>
            <span class="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200/60">
              7일 이내
            </span>
          </div>
          <span class="text-[11px] font-bold text-slate-400">총 {{ recentSchedules.length }}건</span>
        </div>

        <div v-if="recentSchedules.length === 0" class="p-6 bg-white rounded-2xl border border-slate-100 text-center space-y-1">
          <Inbox class="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p class="text-xs font-bold text-slate-600">최근 새로 등록된 일정이 없습니다.</p>
          <p class="text-[11px] text-slate-400">새로운 봉사 일정이 등록되면 여기에 표시됩니다.</p>
        </div>

        <div v-else class="space-y-2">
          <ScheduleCard
            v-for="sched in recentSchedules"
            :key="sched.id"
            :schedule="sched"
          />
        </div>
      </section>

      <!-- Section 3: 신청 가능한 일정 -->
      <section class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarDays class="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 class="text-sm font-black text-slate-900 tracking-tight">신청 가능한 일정</h3>
            <span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
              모집중
            </span>
          </div>
          <span class="text-[11px] font-bold text-slate-400">총 {{ openSchedules.length }}건</span>
        </div>

        <div v-if="openSchedules.length === 0" class="p-6 bg-white rounded-2xl border border-slate-100 text-center space-y-1">
          <Inbox class="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p class="text-xs font-bold text-slate-600">현재 모집 중인 일정이 없습니다.</p>
          <p class="text-[11px] text-slate-400">모든 일정이 마감되었거나 종료되었습니다.</p>
        </div>

        <div v-else class="space-y-2">
          <ScheduleCard
            v-for="sched in openSchedules"
            :key="sched.id"
            :schedule="sched"
          />
        </div>
      </section>
    </template>

  </div>
</template>
