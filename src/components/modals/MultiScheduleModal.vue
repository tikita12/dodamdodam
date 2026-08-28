<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Schedule } from '@/types'
import { formatTimeRange } from '@/utils/datetime'
import { computeScheduleStatus } from '@/utils/status'
import { Calendar, X, Users, ChevronRight } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  dateString: string
  schedules: Schedule[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

function handleSelect(schedule: Schedule) {
  emit('close')
  router.push(`/schedule/${schedule.id}`)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
  >
    <div class="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 leading-tight">{{ dateString }}</h3>
            <p class="text-[11px] text-slate-400">총 {{ schedules.length }}개의 봉사 일정</p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Schedule List -->
      <div class="flex-1 overflow-y-auto my-3 space-y-2 pr-1">
        <div
          v-for="sched in schedules"
          :key="sched.id"
          @click="handleSelect(sched)"
          class="p-3.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 rounded-2xl transition cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div class="space-y-1.5 flex-1 min-w-0 pr-2">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'text-[10px] font-extrabold px-2 py-0.5 rounded-full border',
                  computeScheduleStatus(sched).bgClass,
                  computeScheduleStatus(sched).textClass,
                  computeScheduleStatus(sched).borderClass,
                ]"
              >
                {{ computeScheduleStatus(sched).label }}
              </span>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md truncate">
                {{ sched.subject }}
              </span>
            </div>

            <h4 class="text-xs font-extrabold text-slate-900 truncate">
              {{ sched.schoolName }}
            </h4>

            <div class="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span>{{ formatTimeRange(sched.startAt, sched.endAt) }}</span>
              <span class="flex items-center gap-1 font-bold text-slate-700">
                <Users class="w-3 h-3 text-slate-400" />
                {{ sched.appliedCount }}/{{ sched.requiredCount }}명
              </span>
            </div>
          </div>

          <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition shrink-0" />
        </div>
      </div>

      <!-- Footer Button -->
      <div class="pt-2 border-t border-slate-100">
        <button
          type="button"
          @click="emit('close')"
          class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
