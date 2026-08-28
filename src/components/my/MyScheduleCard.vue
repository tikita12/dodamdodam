<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Schedule } from '@/types'
import { formatScheduleDateTime } from '@/utils/datetime'
import { computeScheduleStatus } from '@/utils/status'
import { Calendar, Users, ChevronRight, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  schedule: Schedule
}>()

const router = useRouter()
const statusInfo = computed(() => computeScheduleStatus(props.schedule))

function handleClick() {
  router.push(`/schedule/${props.schedule.id}`)
}
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'p-4.5 bg-white rounded-3xl border shadow-xs transition-all cursor-pointer flex items-center justify-between group active:scale-98',
      statusInfo.isGrayscale ? 'grayscale opacity-75 border-slate-200 bg-slate-50/60' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md',
      statusInfo.status === 'in_progress' ? 'ring-2 ring-purple-400 border-purple-200' : ''
    ]"
  >
    <div class="space-y-2 flex-1 min-w-0 pr-3">
      <!-- Status & Badges -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <!-- Main Status Badge -->
        <span
          :class="[
            'text-[10px] font-extrabold px-2 py-0.5 rounded-full border',
            statusInfo.bgClass,
            statusInfo.textClass,
            statusInfo.borderClass,
          ]"
        >
          {{ statusInfo.label }}
        </span>

        <!-- Subject Badge -->
        <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md truncate">
          {{ schedule.subject }}
        </span>

        <!-- In-progress notice -->
        <span
          v-if="statusInfo.status === 'in_progress'"
          class="text-[9px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full animate-pulse"
        >
          ● 오늘 활동
        </span>
      </div>

      <!-- School Name -->
      <h4 class="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition truncate">
        {{ schedule.schoolName }}
      </h4>

      <!-- Date & Personnel Meta -->
      <div class="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span class="flex items-center gap-1">
          <Calendar class="w-3.5 h-3.5 text-slate-400" />
          {{ formatScheduleDateTime(schedule.startAt, schedule.endAt) }}
        </span>
        <span class="flex items-center gap-1 font-bold text-slate-700">
          <Users class="w-3.5 h-3.5 text-slate-400" />
          {{ schedule.appliedCount }}/{{ schedule.requiredCount }}명
        </span>
      </div>

      <!-- Cancelled notice -->
      <div
        v-if="schedule.status === 'cancelled'"
        class="text-[11px] text-rose-600 font-bold flex items-center gap-1 pt-0.5"
      >
        <AlertTriangle class="w-3 h-3" /> 관리자에 의해 취소된 일정입니다.
      </div>
    </div>

    <!-- Arrow Indicator -->
    <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
  </div>
</template>
