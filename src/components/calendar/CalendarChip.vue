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
      'w-full text-[10px] leading-snug px-1.5 py-0.5 rounded-md font-extrabold truncate transition-all active:scale-95 block mb-1 border shadow-2xs cursor-pointer text-center',
      statusInfo.isGrayscale ? 'grayscale opacity-70 bg-slate-100 text-slate-500 border-slate-200' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'open' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'closed' ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' : '',
      !statusInfo.isGrayscale && statusInfo.status === 'in_progress' ? 'bg-purple-50 text-purple-800 border-purple-200 animate-pulse' : '',
    ]"
    :title="`${schedule.schoolName} (${schedule.appliedCount}/${schedule.requiredCount}명) - ${schedule.subject}`"
  >
    <span v-if="schedule.status === 'cancelled'" class="text-rose-600 font-black mr-0.5">취소:</span>
    <span>{{ shortSchoolName }}</span>
  </button>
</template>
