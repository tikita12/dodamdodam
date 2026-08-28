<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { subscribeAllSchedules } from '@/services/scheduleService'
import { subscribeVolunteers } from '@/services/volunteerService'
import type { Schedule, Volunteer } from '@/types'
import { computeScheduleStatus } from '@/utils/status'
import { toDayjs } from '@/utils/datetime'
import StatusFilterTabs from '@/components/admin/StatusFilterTabs.vue'
import type { AdminFilterTab } from '@/components/admin/StatusFilterTabs.vue'
import AdminScheduleCard from '@/components/admin/AdminScheduleCard.vue'
import {
  Shield,
  Plus,
  Users,
  BookOpen,
  Inbox,
  Loader2,
  AlertCircle,
  RotateCcw,
} from '@lucide/vue'
import dayjs from 'dayjs'

const schedules = ref<Schedule[]>([])
const volunteers = ref<Volunteer[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const activeTab = ref<AdminFilterTab>('all')

let unsubscribeSchedules: (() => void) | null = null
let unsubscribeVolunteers: (() => void) | null = null

function loadData() {
  isLoading.value = true
  loadError.value = null

  // 1. 전체 일정 구독
  unsubscribeSchedules = subscribeAllSchedules(
    (list) => {
      schedules.value = list
      isLoading.value = false
    },
    (err) => {
      isLoading.value = false
      loadError.value = '일정 목록을 불러오지 못했습니다.'
      console.error(err)
    }
  )

  // 2. 전체 봉사자 구독 (수동 추가 드롭다운용)
  unsubscribeVolunteers = subscribeVolunteers((list) => {
    volunteers.value = list
  })
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (unsubscribeSchedules) unsubscribeSchedules()
  if (unsubscribeVolunteers) unsubscribeVolunteers()
})

// 탭별 카운트 계산
const tabCounts = computed<Record<AdminFilterTab, number>>(() => {
  const now = dayjs()
  const counts: Record<AdminFilterTab, number> = {
    all: schedules.value.length,
    open: 0,
    closed: 0,
    confirmed: 0,
    in_progress: 0,
    ended: 0,
    cancelled: 0,
  }

  schedules.value.forEach((s) => {
    const status = computeScheduleStatus(s, now).status
    if (status in counts) {
      counts[status]++
    }
  })

  return counts
})

// 필터링된 일정 목록 (최근 날짜가 가장 먼저 오도록 내림차순 정렬)
const filteredSchedules = computed(() => {
  const now = dayjs()
  let list: Schedule[] = []
  if (activeTab.value === 'all') {
    list = [...schedules.value]
  } else {
    list = schedules.value.filter((s) => {
      return computeScheduleStatus(s, now).status === activeTab.value
    })
  }

  // 최근 날짜가 가장 먼저 오도록 내림차순 정렬 (10월 -> 8월 -> 7월 -> ... -> 3월)
  return list.sort((a, b) => toDayjs(b.startAt).valueOf() - toDayjs(a.startAt).valueOf())
})
</script>

<template>
  <div class="p-4 space-y-4 pb-20 animate-in fade-in duration-200">
    
    <!-- Admin Top Banner & Quick Links -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-slate-900/15 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Shield class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-black tracking-tight flex items-center gap-1.5">
              <span>관리자 대시보드</span>
            </h2>
            <p class="text-xs text-slate-400 font-medium mt-0.5">봉사 일정 및 참여 명단 관리</p>
          </div>
        </div>

        <router-link
          to="/admin/schedule/new"
          class="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl text-xs font-black flex items-center gap-1 shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>새 일정</span>
        </router-link>
      </div>

      <!-- Quick Sub-Menu Grid -->
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
        <router-link
          to="/admin/volunteers"
          class="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 transition active:scale-98 text-xs font-bold text-slate-200"
        >
          <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users class="w-3.5 h-3.5" />
          </div>
          <div>
            <p class="leading-tight">봉사자 관리</p>
            <p class="text-[10px] text-slate-400 font-normal mt-0.5">{{ volunteers.length }}명 등록됨</p>
          </div>
        </router-link>

        <router-link
          to="/admin/subjects"
          class="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700/80 flex items-center gap-2.5 transition active:scale-98 text-xs font-bold text-slate-200"
        >
          <div class="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <BookOpen class="w-3.5 h-3.5" />
          </div>
          <div>
            <p class="leading-tight">교육과목 관리</p>
            <p class="text-[10px] text-slate-400 font-normal mt-0.5">과목 목록 CRUD</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Status Filter Tabs -->
    <section>
      <StatusFilterTabs
        :active-tab="activeTab"
        :counts="tabCounts"
        @update:active-tab="activeTab = $event"
      />
    </section>

    <!-- Main List Section -->
    <section class="space-y-3 pt-1">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-black text-slate-500 uppercase tracking-wider">
          일정 목록 (최신순 {{ filteredSchedules.length }}건)
        </h3>
        <span class="text-[11px] text-slate-400">카드를 클릭해 명단 관리</span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && schedules.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Loader2 class="w-7 h-7 animate-spin text-emerald-500" />
        <p class="text-xs font-bold">일정 데이터를 불러오는 중...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="loadError && schedules.length === 0"
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
        v-else-if="filteredSchedules.length === 0"
        class="p-8 bg-white rounded-3xl border border-slate-100 text-center space-y-3 shadow-sm"
      >
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Inbox class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-extrabold text-slate-800">해당 상태의 일정이 없습니다.</p>
          <p class="text-xs text-slate-400">새로운 봉사 일정을 등록해보세요.</p>
        </div>
        <router-link
          to="/admin/schedule/new"
          class="inline-flex px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-extrabold shadow-sm items-center gap-1.5 transition active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>새 일정 등록하기</span>
        </router-link>
      </div>

      <!-- Accordion Schedule Cards List (Descending sorted) -->
      <div v-else class="space-y-3">
        <AdminScheduleCard
          v-for="sched in filteredSchedules"
          :key="sched.id"
          :schedule="sched"
          :all-volunteers="volunteers"
        />
      </div>
    </section>

  </div>
</template>
