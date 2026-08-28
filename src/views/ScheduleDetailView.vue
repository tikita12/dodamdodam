<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { getScheduleById, adminCancelSchedule } from '@/services/scheduleService'
import { subscribeScheduleResponses } from '@/services/applicationService'
import type { Schedule, VolunteerResponse } from '@/types'
import { formatFullDate, formatTimeRange, isWithinRecentDays } from '@/utils/datetime'
import { computeScheduleStatus } from '@/utils/status'
import KakaoMap from '@/components/map/KakaoMap.vue'
import ParticipantList from '@/components/schedule/ParticipantList.vue'
import ApplicationButton from '@/components/schedule/ApplicationButton.vue'
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Edit,
  Ban,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const scheduleId = computed(() => route.params.id as string)

const schedule = ref<Schedule | null>(null)
const responses = ref<VolunteerResponse[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isCancelling = ref(false)

let unsubscribeResponses: (() => void) | null = null

async function loadData() {
  isLoading.value = true
  loadError.value = null

  try {
    const data = await getScheduleById(scheduleId.value)
    if (!data) {
      loadError.value = '해당 일정을 찾을 수 없습니다.'
      return
    }
    schedule.value = data

    // 신청자 목록 실시간 구독
    if (unsubscribeResponses) unsubscribeResponses()
    unsubscribeResponses = subscribeScheduleResponses(
      scheduleId.value,
      (list) => {
        responses.value = list
        if (schedule.value) {
          schedule.value.appliedCount = list.length
        }
      },
      (err) => console.error(err)
    )
  } catch (err) {
    loadError.value = '일정 정보를 불러오는데 실패했습니다.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

watch(
  () => scheduleId.value,
  (newId) => {
    if (newId) loadData()
  }
)

onUnmounted(() => {
  if (unsubscribeResponses) unsubscribeResponses()
})

const statusInfo = computed(() => {
  if (!schedule.value) return null
  return computeScheduleStatus(schedule.value)
})

const isNew = computed(() => {
  if (!schedule.value) return false
  return isWithinRecentDays(schedule.value.createdAt, 7)
})

// 관리자: 일정 취소 처리 (0초 즉시 반영)
async function handleAdminCancelSchedule() {
  if (!schedule.value) return
  if (!confirm('정말로 이 일정을 취소하시겠습니까? (취소된 일정은 복원할 수 없습니다)')) {
    return
  }

  isCancelling.value = true
  try {
    await adminCancelSchedule(schedule.value.id)
    schedule.value.status = 'cancelled'
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
  <div class="p-4 space-y-4 pb-28 animate-in fade-in duration-200">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
      <Loader2 class="w-8 h-8 animate-spin text-emerald-500" />
      <p class="text-xs font-bold">일정 정보를 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="loadError || !schedule"
      class="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3 my-8"
    >
      <AlertCircle class="w-8 h-8 text-rose-500 mx-auto" />
      <p class="text-xs font-bold text-rose-700">{{ loadError || '일정 정보가 없습니다.' }}</p>
      <button
        type="button"
        @click="router.push('/main')"
        class="px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100"
      >
        일정 목록으로 돌아가기
      </button>
    </div>

    <template v-else>
      <!-- 1. Header Card (Status, School Name, Subject) -->
      <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- 6-tier Status Badge -->
            <span
              v-if="statusInfo"
              :class="[
                'text-xs font-extrabold px-2.5 py-1 rounded-full border',
                statusInfo.bgClass,
                statusInfo.textClass,
                statusInfo.borderClass,
              ]"
            >
              {{ statusInfo.label }}
            </span>

            <!-- Subject Badge -->
            <span class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {{ schedule.subject }}
            </span>

            <!-- NEW Badge -->
            <span
              v-if="isNew && schedule.status !== 'cancelled'"
              class="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-0.5"
            >
              <Sparkles class="w-3 h-3 fill-rose-600" /> NEW
            </span>
          </div>

          <div class="text-xs font-bold text-slate-400">
            모집 {{ schedule.appliedCount }}/{{ schedule.requiredCount }}명
          </div>
        </div>

        <h2 class="text-xl font-black text-slate-900 tracking-tight leading-snug">
          {{ schedule.schoolName }}
        </h2>
      </div>

      <!-- 2. Detailed Schedule Info Card -->
      <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
        <h3 class="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <BookOpen class="w-4 h-4 text-emerald-600" />
          <span>봉사 세부 내용</span>
        </h3>

        <div class="space-y-3 text-xs">
          <!-- Date -->
          <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
            <Calendar class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span class="text-slate-400 font-bold block text-[10px]">봉사 일자</span>
              <span class="text-slate-900 font-bold">{{ formatFullDate(schedule.startAt) }}</span>
            </div>
          </div>

          <!-- Time Range -->
          <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
            <Clock class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span class="text-slate-400 font-bold block text-[10px]">활동 시간</span>
              <span class="text-slate-900 font-bold">{{ formatTimeRange(schedule.startAt, schedule.endAt) }}</span>
            </div>
          </div>

          <!-- Class Info -->
          <div v-if="schedule.classInfo" class="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
            <Users class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span class="text-slate-400 font-bold block text-[10px]">대상 및 학급 정보</span>
              <span class="text-slate-900 font-semibold leading-relaxed">{{ schedule.classInfo }}</span>
            </div>
          </div>

          <!-- Note / Preparation -->
          <div v-if="schedule.note" class="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
            <FileText class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span class="text-amber-800 font-bold block text-[10px]">비고 및 준비사항</span>
              <span class="text-slate-800 font-medium leading-relaxed">{{ schedule.note }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Kakao Map Card -->
      <KakaoMap
        :school-name="schedule.schoolName"
        :address="schedule.address"
        :latitude="schedule.latitude"
        :longitude="schedule.longitude"
      />

      <!-- 4. Participant List Card -->
      <ParticipantList
        :required-count="schedule.requiredCount"
        :applied-count="schedule.appliedCount"
        :responses="responses"
      />

      <!-- 5. Bottom Action Bar -->
      <!-- Case A: Admin Mode Action Bar -->
      <div
        v-if="sessionStore.isAdmin"
        class="fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 max-w-md mx-auto flex gap-2"
      >
        <router-link
          :to="`/admin/schedule/${schedule.id}/edit`"
          class="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl flex items-center justify-center gap-1.5 text-xs transition active:scale-98"
        >
          <Edit class="w-3.5 h-3.5" />
          <span>일정 수정</span>
        </router-link>

        <button
          type="button"
          @click="handleAdminCancelSchedule"
          :disabled="isCancelling || schedule.status === 'cancelled'"
          class="flex-1 py-3 px-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-700 border border-rose-200 font-extrabold rounded-2xl flex items-center justify-center gap-1.5 text-xs transition active:scale-98 cursor-pointer"
        >
          <Loader2 v-if="isCancelling" class="w-3.5 h-3.5 animate-spin" />
          <template v-else>
            <Ban class="w-3.5 h-3.5" />
            <span>{{ schedule.status === 'cancelled' ? '취소된 일정' : '일정 취소' }}</span>
          </template>
        </button>
      </div>

      <!-- Case B: Volunteer Mode Application Action Bar -->
      <ApplicationButton
        v-else
        :schedule="schedule"
        :responses="responses"
      />
    </template>

  </div>
</template>
