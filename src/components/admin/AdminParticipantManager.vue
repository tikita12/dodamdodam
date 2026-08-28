<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Volunteer, VolunteerResponse } from '@/types'
import {
  adminAddParticipant,
  adminRemoveParticipant,
} from '@/services/applicationService'
import { Users, User, X, Plus, Loader2 } from '@lucide/vue'

const props = defineProps<{
  scheduleId: string
  requiredCount: number
  appliedCount: number
  responses: VolunteerResponse[]
  allVolunteers: Volunteer[]
}>()

const selectedVolunteerIdToAdd = ref('')
const isLoading = ref(false)

// 아직 신청하지 않은 봉사자 목록
const unassignedVolunteers = computed(() => {
  const assignedIds = new Set(props.responses.map((r) => r.volunteerId))
  return props.allVolunteers.filter((v) => !assignedIds.has(v.id))
})

async function handleAdd() {
  if (!selectedVolunteerIdToAdd.value) return

  const target = props.allVolunteers.find((v) => v.id === selectedVolunteerIdToAdd.value)
  if (!target) return

  isLoading.value = true
  try {
    await adminAddParticipant(props.scheduleId, target.id, target.name)
    selectedVolunteerIdToAdd.value = ''
  } catch (err) {
    alert(err instanceof Error ? err.message : '참여자 추가 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

async function handleRemove(volunteerId: string, volunteerName: string) {
  if (!confirm(`'${volunteerName}' 봉사자를 명단에서 제외하시겠습니까?`)) {
    return
  }

  isLoading.value = true
  try {
    await adminRemoveParticipant(props.scheduleId, volunteerId)
  } catch (err) {
    alert(err instanceof Error ? err.message : '참여자 제외 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h5 class="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
        <Users class="w-3.5 h-3.5 text-emerald-600" />
        <span>참여자 명단 관리</span>
      </h5>
      <span class="text-xs font-extrabold text-slate-700">
        <span :class="appliedCount > requiredCount ? 'text-rose-600 font-black' : 'text-emerald-700'">
          {{ appliedCount }}
        </span>
        <span class="text-slate-400"> / {{ requiredCount }}명</span>
        <span v-if="appliedCount > requiredCount" class="text-[10px] text-rose-500 ml-1 font-bold">(초과)</span>
      </span>
    </div>

    <!-- Current Participants List -->
    <div class="space-y-1.5">
      <div v-if="responses.length === 0" class="text-center py-4 text-xs text-slate-400">
        신청된 참여자가 없습니다.
      </div>
      <div
        v-for="resp in responses"
        :key="resp.id"
        class="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs"
      >
        <div class="flex items-center gap-2 font-bold text-slate-800">
          <User class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ resp.volunteerName }}</span>
        </div>
        <button
          type="button"
          @click="handleRemove(resp.volunteerId, resp.volunteerName)"
          :disabled="isLoading"
          class="w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="명단에서 제외"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Add Participant Dropdown Field -->
    <div class="pt-2 border-t border-slate-200/60 flex items-center gap-2">
      <select
        v-model="selectedVolunteerIdToAdd"
        class="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="" disabled selected>봉사자 직접 추가...</option>
        <option
          v-for="v in unassignedVolunteers"
          :key="v.id"
          :value="v.id"
        >
          {{ v.name }}
        </option>
      </select>

      <button
        type="button"
        @click="handleAdd"
        :disabled="isLoading || !selectedVolunteerIdToAdd"
        class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
      >
        <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
        <template v-else>
          <Plus class="w-3.5 h-3.5" /> 추가
        </template>
      </button>
    </div>
  </div>
</template>
