<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Schedule } from '@/types'
import { formatScheduleDateTime, isWithinRecentDays } from '@/utils/datetime'
import { computeScheduleStatus } from '@/utils/status'
import { Calendar, Users, ChevronRight, Sparkles } from '@lucide/vue'

const props = defineProps<{
  schedule: Schedule
}>()

const router = useRouter()
const statusInfo = computed(() => computeScheduleStatus(props.schedule))
const isNew = computed(() => isWithinRecentDays(props.schedule.createdAt, 7))

function handleClick() {
  router.push(`/schedule/${props.schedule.id}`)
}
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'p-4 bg-white rounded-2xl border shadow-xs transition-all cursor-pointer flex items-center justify-between group active:scale-98',
      statusInfo.isGrayscale ? 'grayscale opacity-75 border-slate-200 bg-slate-50/50' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'
    ]"
  >
    <div class="space-y-2 flex-1 min-w-0 pr-2">
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

        <!-- NEW Badge (최근 7일 이내) -->
        <span
          v-if="isNew && schedule.status !== 'cancelled'"
          class="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
        >
          <Sparkles class="w-2.5 h-2.5 fill-rose-600" /> NEW
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
    </div>

    <!-- Arrow Indicator -->
    <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
  </div>
</template>
