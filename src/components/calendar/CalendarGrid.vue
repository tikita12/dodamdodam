<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Schedule } from '@/types'
import { toDayjs, formatFullDate } from '@/utils/datetime'
import CalendarChip from './CalendarChip.vue'
import MultiScheduleModal from '@/components/modals/MultiScheduleModal.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  schedules: Schedule[]
}>()

const currentMonth = ref(dayjs().startOf('month'))

// 다중 일정 모달 상태
const isMultiModalOpen = ref(false)
const selectedModalDateString = ref('')
const selectedModalSchedules = ref<Schedule[]>([])

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
}

function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, 'month')
}

function goToToday() {
  currentMonth.value = dayjs().startOf('month')
}

// 캘린더 날짜 셀 데이터 인터페이스
interface CalendarDay {
  date: dayjs.Dayjs
  dateString: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSunday: boolean
  isSaturday: boolean
  schedules: Schedule[]
}

const calendarDays = computed<CalendarDay[]>(() => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')
  const startDay = startOfMonth.day() // 0(일) ~ 6(토)
  const totalDays = endOfMonth.date()

  const days: CalendarDay[] = []

  // 1. 이전 달 날짜 패딩
  for (let i = startDay - 1; i >= 0; i--) {
    const d = startOfMonth.subtract(i + 1, 'day')
    days.push(createDayObject(d, false))
  }

  // 2. 현재 달 날짜들
  for (let i = 1; i <= totalDays; i++) {
    const d = currentMonth.value.date(i)
    days.push(createDayObject(d, true))
  }

  // 3. 다음 달 날짜 패딩 (7의 배수 맞춤)
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = endOfMonth.add(i, 'day')
      days.push(createDayObject(d, false))
    }
  }

  return days
})

function createDayObject(d: dayjs.Dayjs, isCurrentMonth: boolean): CalendarDay {
  const dateStr = d.format('YYYY-MM-DD')
  // 해당 일자에 시작하는 일정 매핑
  const matched = props.schedules.filter((s) => {
    return toDayjs(s.startAt).format('YYYY-MM-DD') === dateStr
  })

  return {
    date: d,
    dateString: dateStr,
    dayNumber: d.date(),
    isCurrentMonth,
    isToday: d.isSame(dayjs(), 'day'),
    isSunday: d.day() === 0,
    isSaturday: d.day() === 6,
    schedules: matched,
  }
}

function openMultiModal(day: CalendarDay) {
  selectedModalDateString.value = formatFullDate(day.date.toDate())
  selectedModalSchedules.value = day.schedules
  isMultiModalOpen.value = true
}
</script>

<template>
  <div class="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
    <!-- Calendar Navigation Header -->
    <div class="flex items-center justify-between mb-3 px-1">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-black text-slate-900 tracking-tight">
          {{ currentMonth.format('YYYY년 M월') }}
        </h3>
        <button
          type="button"
          @click="goToToday"
          class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
        >
          오늘
        </button>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="prevMonth"
          class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition active:scale-95 cursor-pointer"
          title="이전 달"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="nextMonth"
          class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition active:scale-95 cursor-pointer"
          title="다음 달"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Day of Week Headers -->
    <div class="grid grid-cols-7 text-center pb-2 border-b border-slate-100 text-xs font-bold">
      <div class="text-rose-500">일</div>
      <div class="text-slate-600">월</div>
      <div class="text-slate-600">화</div>
      <div class="text-slate-600">수</div>
      <div class="text-slate-600">목</div>
      <div class="text-slate-600">금</div>
      <div class="text-blue-500">토</div>
    </div>

    <!-- Calendar Days Grid -->
    <div class="grid grid-cols-7 gap-1 pt-2">
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        :class="[
          'min-h-[78px] p-1 rounded-xl flex flex-col justify-start transition border border-transparent',
          !day.isCurrentMonth ? 'opacity-35 bg-slate-50/50' : 'bg-slate-50/70 hover:border-emerald-200',
          day.isToday ? 'ring-1.5 ring-emerald-500 bg-emerald-50/30' : ''
        ]"
      >
        <!-- Date Header -->
        <div class="flex items-center justify-between mb-1">
          <span
            :class="[
              'text-[11px] font-bold inline-flex items-center justify-center w-5 h-5 rounded-full',
              day.isToday ? 'bg-emerald-600 text-white shadow-xs font-black' : '',
              !day.isToday && day.isSunday ? 'text-rose-500' : '',
              !day.isToday && day.isSaturday ? 'text-blue-500' : '',
              !day.isToday && !day.isSunday && !day.isSaturday ? 'text-slate-700' : ''
            ]"
          >
            {{ day.dayNumber }}
          </span>

          <!-- Schedule Count Dot for small viewports -->
          <span
            v-if="day.schedules.length > 0"
            class="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1 rounded-full"
          >
            {{ day.schedules.length }}
          </span>
        </div>

        <!-- Schedule Chips inside day cell -->
        <div class="flex-1 flex flex-col gap-0.5 overflow-hidden">
          <template v-if="day.schedules.length > 0">
            <!-- 1st Schedule Chip -->
            <CalendarChip :schedule="day.schedules[0]" />

            <!-- +N more button if 2 or more -->
            <button
              v-if="day.schedules.length > 1"
              type="button"
              @click.stop="openMultiModal(day)"
              class="w-full text-[9px] font-extrabold py-0.5 px-1 bg-slate-200/80 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded transition text-center cursor-pointer active:scale-95"
            >
              +{{ day.schedules.length - 1 }}개 더
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Multi Schedule Popup Modal -->
    <MultiScheduleModal
      :is-open="isMultiModalOpen"
      :date-string="selectedModalDateString"
      :schedules="selectedModalSchedules"
      @close="isMultiModalOpen = false"
    />
  </div>
</template>
