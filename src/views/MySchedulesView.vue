<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { subscribeVolunteerResponses } from '@/services/applicationService'
import { subscribeAllSchedules } from '@/services/scheduleService'
import type { Schedule, VolunteerResponse } from '@/types'
import { toDayjs } from '@/utils/datetime'
import { computeScheduleStatus } from '@/utils/status'
import MyScheduleCard from '@/components/my/MyScheduleCard.vue'
import {
  CalendarCheck,
  User,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Inbox,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-vue-next'
import dayjs from 'dayjs'

const router = useRouter()
const sessionStore = useSessionStore()

const allSchedules = ref<Schedule[]>([])
const myResponses = ref<VolunteerResponse[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

let unsubscribeSchedules: (() => void) | null = null
let unsubscribeResponses: (() => void) | null = null

function loadData() {
  if (sessionStore.isAdmin) {
    router.replace('/admin')
    return
  }

  if (!sessionStore.volunteerId) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = null

  // 1. 전체 일정 구독
  unsubscribeSchedules = subscribeAllSchedules(
    (sList) => {
      allSchedules.value = sList
      isLoading.value = false
    },
    (err) => {
      isLoading.value = false
      loadError.value = '일정 정보를 불러오지 못했습니다.'
      console.error(err)
    }
  )

  // 2. 본인 신청 목록 구독
  unsubscribeResponses = subscribeVolunteerResponses(
    sessionStore.volunteerId,
    (rList) => {
      myResponses.value = rList
    },
    (err) => console.error(err)
  )
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (unsubscribeSchedules) unsubscribeSchedules()
  if (unsubscribeResponses) unsubscribeResponses()
})

// 내가 신청한 Schedule 객체 목록
const mySchedules = computed<Schedule[]>(() => {
  const appliedScheduleIds = new Set(myResponses.value.map((r) => r.scheduleId))
  return allSchedules.value.filter((s) => appliedScheduleIds.has(s.id))
})

// 3단계 정렬 엔진:
// 1. 진행중 일정
// 2. 다가오는 일정 (날짜 오름차순)
// 3. 지난 일정 / 취소된 일정 (날짜 내림차순)
const sortedMySchedules = computed<Schedule[]>(() => {
  const now = dayjs()

  const inProgress: Schedule[] = []
  const upcoming: Schedule[] = []
  const pastOrCancelled: Schedule[] = []

  mySchedules.value.forEach((s) => {
    const status = computeScheduleStatus(s, now).status
    if (status === 'in_progress') {
      inProgress.push(s)
    } else if (status === 'open' || status === 'closed' || status === 'confirmed') {
      upcoming.push(s)
    } else {
      pastOrCancelled.push(s)
    }
  })

  // 다가오는 일정: 빠른 날짜 순 (오름차순)
  upcoming.sort((a, b) => toDayjs(a.startAt).valueOf() - toDayjs(b.startAt).valueOf())

  // 지난/취소 일정: 최근 날짜 순 (내림차순)
  pastOrCancelled.sort((a, b) => toDayjs(b.startAt).valueOf() - toDayjs(a.startAt).valueOf())

  return [...inProgress, ...upcoming, ...pastOrCancelled]
})

// 요약 통계
const upcomingCount = computed(() => {
  const now = dayjs()
  return mySchedules.value.filter((s) => {
    const status = computeScheduleStatus(s, now).status
    return status === 'in_progress' || status === 'open' || status === 'closed' || status === 'confirmed'
  }).length
})

const completedCount = computed(() => {
  const now = dayjs()
  return mySchedules.value.filter((s) => {
    const status = computeScheduleStatus(s, now).status
    return status === 'ended'
  }).length
})
</script>

<template>
  <div class="p-4 space-y-5 pb-16 animate-in fade-in duration-200">
    
    <!-- Profile & Header Banner -->
    <div class="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg shadow-emerald-600/20 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs">
            <User class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-black tracking-tight">{{ sessionStore.volunteerName || '봉사자' }} 님</h2>
              <!-- Name Change Trigger -->
              <button
                type="button"
                @click="sessionStore.openVolunteerModal"
                class="px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-bold border border-white/20 flex items-center gap-0.5 transition active:scale-95 cursor-pointer"
              >
                <span>변경</span>
                <ChevronDown class="w-3 h-3" />
              </button>
            </div>
            <p class="text-xs text-emerald-100 font-medium mt-0.5">도담도담 자원봉사자</p>
          </div>
        </div>

        <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <CalendarCheck class="w-4 h-4 text-emerald-200" />
        </div>
      </div>

      <!-- Quick Summary Stats Grid -->
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
        <div class="bg-white/10 rounded-2xl p-3 backdrop-blur-2xs border border-white/10">
          <span class="text-[10px] font-bold text-emerald-100 flex items-center gap-1">
            <Sparkles class="w-3 h-3 text-amber-300" /> 다가오는 봉사
          </span>
          <p class="text-lg font-black mt-0.5">{{ upcomingCount }}<span class="text-xs font-semibold ml-0.5">건</span></p>
        </div>

        <div class="bg-white/10 rounded-2xl p-3 backdrop-blur-2xs border border-white/10">
          <span class="text-[10px] font-bold text-emerald-100 flex items-center gap-1">
            <CheckCircle2 class="w-3 h-3 text-emerald-200" /> 완료된 봉사
          </span>
          <p class="text-lg font-black mt-0.5">{{ completedCount }}<span class="text-xs font-semibold ml-0.5">건</span></p>
        </div>
      </div>
    </div>

    <!-- Main List Section -->
    <section class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <span>내 참여 신청 목록</span>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            총 {{ sortedMySchedules.length }}건
          </span>
        </h3>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Loader2 class="w-7 h-7 animate-spin text-emerald-500" />
        <p class="text-xs font-bold">신청 내역을 불러오는 중입니다...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="loadError"
        class="p-4 bg-rose-50 border border-rose-200 rounded-3xl text-xs text-rose-700 flex flex-col items-center gap-2 text-center"
      >
        <AlertCircle class="w-6 h-6 text-rose-500" />
        <span class="font-semibold">{{ loadError }}</span>
        <button
          type="button"
          @click="loadData"
          class="mt-1 px-3 py-1 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1"
        >
          <RotateCcw class="w-3 h-3" /> 다시 시도
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="sortedMySchedules.length === 0"
        class="p-8 bg-white rounded-3xl border border-slate-100 text-center space-y-3 shadow-sm"
      >
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Inbox class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-extrabold text-slate-800">아직 신청한 봉사 일정이 없습니다.</p>
          <p class="text-xs text-slate-400">모집 중인 일정을 확인하고 참여를 신청해보세요!</p>
        </div>
        <button
          type="button"
          @click="router.push('/main')"
          class="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 mx-auto transition active:scale-95 cursor-pointer"
        >
          <span>모집 중인 일정 둘러보기</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Schedule Cards List -->
      <div v-else class="space-y-2.5">
        <MyScheduleCard
          v-for="sched in sortedMySchedules"
          :key="sched.id"
          :schedule="sched"
        />
      </div>
    </section>

  </div>
</template>
