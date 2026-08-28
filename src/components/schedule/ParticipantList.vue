<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import type { VolunteerResponse } from '@/types'
import { Users, User } from '@lucide/vue'

const props = defineProps<{
  requiredCount: number
  appliedCount: number
  responses: VolunteerResponse[]
}>()

const sessionStore = useSessionStore()

const progressPercent = computed(() => {
  if (props.requiredCount <= 0) return 0
  return Math.min(100, Math.round((props.appliedCount / props.requiredCount) * 100))
})
</script>

<template>
  <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Users class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-extrabold text-slate-800">참여 신청자 현황</h3>
      </div>

      <div class="text-xs font-bold text-slate-700">
        <span class="text-emerald-700 font-extrabold text-sm">{{ appliedCount }}</span>
        <span class="text-slate-400"> / {{ requiredCount }}명</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="space-y-1.5">
      <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-slate-400 font-bold px-0.5">
        <span>모집률 {{ progressPercent }}%</span>
        <span>
          {{ appliedCount >= requiredCount ? '모집 정원 달성' : `${requiredCount - appliedCount}명 추가 모집 중` }}
        </span>
      </div>
    </div>

    <!-- Participant Badges -->
    <div class="pt-1">
      <div v-if="responses.length === 0" class="py-6 text-center text-xs text-slate-400 space-y-1 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <User class="w-6 h-6 text-slate-300 mx-auto" />
        <p class="font-bold text-slate-600">아직 참여 신청한 봉사자가 없습니다.</p>
        <p class="text-[11px]">첫 번째로 참여를 신청해보세요!</p>
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <div
          v-for="resp in responses"
          :key="resp.id"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border',
            resp.volunteerId === sessionStore.volunteerId
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-200/80'
          ]"
        >
          <User class="w-3 h-3 opacity-60" />
          <span>{{ resp.volunteerName }}</span>
          <span
            v-if="resp.volunteerId === sessionStore.volunteerId"
            class="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full"
          >
            나
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
