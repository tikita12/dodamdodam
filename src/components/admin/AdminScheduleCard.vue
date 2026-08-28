<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Schedule, Volunteer, VolunteerResponse } from '@/types'
import { formatScheduleDateTime } from '@/utils/datetime'
import { computeScheduleStatus } from '@/utils/status'
import { subscribeScheduleResponses } from '@/services/applicationService'
import { adminCancelSchedule, adminToggleScheduleConfirm } from '@/services/scheduleService'
import AdminParticipantManager from './AdminParticipantManager.vue'
import {
  Calendar,
  Users,
  ChevronDown,
  Edit,
  CheckCircle2,
  Undo2,
  Ban,
  Loader2,
  MapPin,
  FileText,
} from 'lucide-vue-next'

const props = defineProps<{
  schedule: Schedule
  allVolunteers: Volunteer[]
}>()

const isExpanded = ref(false)
const responses = ref<VolunteerResponse[]>([])
const isTogglingConfirm = ref(false)
const isCancelling = ref(false)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeScheduleResponses(props.schedule.id, (list) => {
    responses.value = list
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const statusInfo = computed(() => computeScheduleStatus(props.schedule))

function toggleAccordion() {
  isExpanded.value = !isExpanded.value
}

async function handleToggleConfirm() {
  isTogglingConfirm.value = true
  try {
    const nextStatus = await adminToggleScheduleConfirm(props.schedule.id, props.schedule.status)
    props.schedule.status = nextStatus as 'open' | 'confirmed'
  } catch (err) {
    alert(err instanceof Error ? err.message : '확정 상태 변경 중 오류가 발생했습니다.')
  } finally {
    isTogglingConfirm.value = false
  }
}

async function handleCancelSchedule() {
  if (!confirm('정말로 이 일정을 취소하시겠습니까? (취소된 일정은 복원할 수 없습니다)')) {
    return
  }

  isCancelling.value = true
  try {
    await adminCancelSchedule(props.schedule.id)
    props.schedule.status = 'cancelled'
    alert('일정이 취소되었습니다.')
  } catch (err) {
    alert('일정 취소 중 오류가 발생했습니다.')
    console.error(err)
  } finally {
    isCancelling.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden transition-all">
    <!-- Accordion Header Row (Click to toggle) -->
    <div
      @click="toggleAccordion"
      class="p-4.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none"
    >
      <div class="space-y-1.5 flex-1 min-w-0 pr-3">
        <!-- Status & Subject Badges -->
        <div class="flex items-center gap-1.5 flex-wrap">
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

          <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md truncate">
            {{ schedule.subject }}
          </span>
        </div>

        <!-- School Name -->
        <h4 class="text-sm font-extrabold text-slate-900 truncate">
          {{ schedule.schoolName }}
        </h4>

        <!-- Meta -->
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

      <!-- Chevron Arrow -->
      <button
        type="button"
        class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200"
        :class="isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600' : ''"
      >
        <ChevronDown class="w-4 h-4" />
      </button>
    </div>

    <!-- Accordion Expandable Body -->
    <div
      v-show="isExpanded"
      class="px-4.5 pb-4.5 pt-2 border-t border-slate-100 space-y-3.5 bg-slate-50/40 animate-in fade-in"
    >
      <!-- Location & Notes Meta -->
      <div class="space-y-2 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-100">
        <div class="flex items-start gap-2">
          <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span class="text-slate-800 font-medium">{{ schedule.address }}</span>
        </div>
        <div v-if="schedule.classInfo" class="flex items-start gap-2">
          <Users class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span class="text-slate-700 font-medium">대상: {{ schedule.classInfo }}</span>
        </div>
        <div v-if="schedule.note" class="flex items-start gap-2">
          <FileText class="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span class="text-slate-700 font-medium">비고: {{ schedule.note }}</span>
        </div>
      </div>

      <!-- Participant Manager Component (Realtime list + Add + Remove) -->
      <AdminParticipantManager
        :schedule-id="schedule.id"
        :required-count="schedule.requiredCount"
        :applied-count="schedule.appliedCount"
        :responses="responses"
        :all-volunteers="allVolunteers"
      />

      <!-- Admin Action Buttons Grid -->
      <div class="flex items-center gap-2 pt-1">
        <!-- 1. Confirm / Unconfirm Button -->
        <button
          type="button"
          @click="handleToggleConfirm"
          :disabled="isTogglingConfirm || schedule.status === 'cancelled'"
          :class="[
            'flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer shadow-2xs',
            schedule.status === 'confirmed'
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          ]"
        >
          <Loader2 v-if="isTogglingConfirm" class="w-3.5 h-3.5 animate-spin" />
          <template v-else-if="schedule.status === 'confirmed'">
            <Undo2 class="w-3.5 h-3.5" /> 확정 취소
          </template>
          <template v-else>
            <CheckCircle2 class="w-3.5 h-3.5" /> 참여 확정
          </template>
        </button>

        <!-- 2. Edit Schedule Button -->
        <router-link
          :to="`/admin/schedule/${schedule.id}/edit`"
          class="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-98"
        >
          <Edit class="w-3.5 h-3.5" /> 수정
        </router-link>

        <!-- 3. Cancel Schedule Button -->
        <button
          type="button"
          @click="handleCancelSchedule"
          :disabled="isCancelling || schedule.status === 'cancelled'"
          class="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-600 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer border border-rose-200/80"
          title="일정 취소"
        >
          <Loader2 v-if="isCancelling" class="w-3.5 h-3.5 animate-spin" />
          <template v-else>
            <Ban class="w-3.5 h-3.5" /> 취소
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
