<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Schedule } from '@/types'
import { computeScheduleStatus } from '@/utils/status'
import { formatShortSchoolName } from '@/utils/datetime'

const props = defineProps<{
  schedule: Schedule
}>()

const router = useRouter()
const statusInfo = computed(() => computeScheduleStatus(props.schedule))

const shortSchoolName = computed(() => {
  return formatShortSchoolName(props.schedule.schoolName)
})

function handleClick() {
  router.push(`/schedule/${props.schedule.id}`)
}
</script>

<template>
  <button
    type="button"
    @click.stop="handleClick"
    :class="[
      'w-full text-[9px] sm:text-[10px] leading-tight px-0.5 sm:px-1 py-0.5 rounded sm:rounded-md font-black tracking-tighter sm:tracking-tight transition-all active:scale-95 block mb-0.5 border shadow-2xs cursor-pointer text-center whitespace-nowrap overflow-hidden text-ellipsis',
      // 취소된 일정 및 종료된 일정: 텍스트 없이 은은한 그레이톤 처리
      statusInfo.isGrayscale ? 'grayscale opacity-60 bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/70' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'open' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'closed' ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'in_progress' ? 'bg-purple-50 text-purple-800 border-purple-200 animate-pulse' : '',
    ]"
    :title="`${schedule.schoolName} (${schedule.appliedCount}/${schedule.requiredCount}명) - ${schedule.subject}`"
  >
    <span>{{ shortSchoolName }}</span>
  </button>
</template>
