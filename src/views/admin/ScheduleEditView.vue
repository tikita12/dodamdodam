<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getScheduleById, updateSchedule, deleteSchedulePermanently } from '@/services/scheduleService'
import { subscribeSubjects } from '@/services/subjectService'
import { openDaumPostcodePopup } from '@/services/addressService'
import { useSessionStore } from '@/stores/session'
import type { Subject, ScheduleFormData } from '@/types'
import { toDayjs } from '@/utils/datetime'
import {
  CalendarDays,
  School,
  BookOpen,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  RotateCcw,
  Trash2,
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()

const scheduleId = computed(() => route.params.id as string)

const formData = ref<ScheduleFormData>({
  schoolName: '',
  subject: '',
  date: '',
  startTime: '',
  endTime: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  requiredCount: 3,
  classInfo: '',
  note: '',
})

// 다음 공식 우편번호 및 도로명 주소 팝업 실행
async function handleOpenPostcode() {
  try {
    await openDaumPostcodePopup((result) => {
      const schoolOrBuilding = result.buildingName || result.roadAddress
      const fullAddr = result.buildingName
        ? `${result.roadAddress} (${result.buildingName})`
        : result.roadAddress

      formData.value.schoolName = schoolOrBuilding
      formData.value.address = fullAddr

      if (result.lat && result.lng) {
        formData.value.latitude = result.lat
        formData.value.longitude = result.lng
      }
    })
  } catch (err) {
    alert(err instanceof Error ? err.message : '주소 검색을 불러오지 못했습니다.')
  }
}

const subjects = ref<Subject[]>([])
const isCustomSubject = ref(false)
const customSubjectText = ref('')
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')

let unsubscribeSubjects: (() => void) | null = null

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const sched = await getScheduleById(scheduleId.value)
    if (!sched) {
      errorMessage.value = '해당 일정을 찾을 수 없습니다.'
      return
    }

    const startD = toDayjs(sched.startAt)
    const endD = toDayjs(sched.endAt)

    formData.value = {
      schoolName: sched.schoolName,
      subject: sched.subject,
      date: startD.format('YYYY-MM-DD'),
      startTime: startD.format('HH:mm'),
      endTime: endD.format('HH:mm'),
      address: sched.address,
      latitude: sched.latitude,
      longitude: sched.longitude,
      requiredCount: sched.requiredCount,
      classInfo: sched.classInfo || '',
      note: sched.note || '',
    }

    // 과목 목록 구독
    unsubscribeSubjects = subscribeSubjects((list) => {
      subjects.value = list
      if (!list.some((s) => s.name === sched.subject)) {
        isCustomSubject.value = true
        customSubjectText.value = sched.subject
      }
    })
  } catch (err) {
    errorMessage.value = '일정 정보를 불러오지 못했습니다.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (unsubscribeSubjects) unsubscribeSubjects()
})

function handleSubjectChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === '__custom__') {
    isCustomSubject.value = true
    formData.value.subject = ''
  } else {
    isCustomSubject.value = false
    formData.value.subject = val
  }
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!formData.value.schoolName || !formData.value.address) {
    errorMessage.value = '학교/주소 검색 버튼을 눌러 봉사 장소를 선택해주세요.'
    return
  }

  if (isCustomSubject.value) {
    if (!customSubjectText.value.trim()) {
      errorMessage.value = '과목명을 직접 입력해주세요.'
      return
    }
    formData.value.subject = customSubjectText.value.trim()
  }

  isSaving.value = true
  try {
    await updateSchedule(scheduleId.value, formData.value)
    router.push('/admin')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '일정 정보 수정 중 오류가 발생했습니다.'
  } finally {
    isSaving.value = false
  }
}

const sessionStore = useSessionStore()
const isSuperAdmin = computed(() => sessionStore.adminUser?.email?.toLowerCase() === 'bshine530@gmail.com')
const isDeleting = ref(false)

async function handleDelete() {
  if (!confirm(`⚠️ 정말로 '${formData.value.schoolName || '이'}' 일정을 DB에서 영구 삭제하시겠습니까?\n\n(영구 삭제 시 신청자 목록 및 일정이 완전히 삭제됩니다)`)) {
    return
  }

  isDeleting.value = true
  try {
    await deleteSchedulePermanently(scheduleId.value)
    alert('일정이 영구 삭제되었습니다.')
    router.push('/admin')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '일정 삭제 중 오류가 발생했습니다.'
  } finally {
    isDeleting.value = false
  }
}

function handleFormKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'submit') {
    e.preventDefault()
  }
}
</script>

<template>
  <div class="p-4 space-y-4 pb-20 animate-in fade-in duration-200">
    
    <!-- Title Header -->
    <div class="flex items-center gap-2.5 px-1">
      <div class="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
        <CalendarDays class="w-5 h-5" />
      </div>
      <div>
        <h2 class="text-base font-black text-slate-900 tracking-tight">봉사 일정 수정</h2>
        <p class="text-xs text-slate-400">주소 검색 버튼을 눌러 학교 및 봉사장소를 선택하세요</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
      <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
      <p class="text-xs font-bold">일정 정보를 불러오는 중...</p>
    </div>

    <!-- Error Alert -->
    <div
      v-else-if="errorMessage"
      class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Form Container -->
    <form v-else @submit.prevent="handleSubmit" @keydown.enter="handleFormKeyDown" class="space-y-4">
      
      <!-- Card 1: School & Location + Subject -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        
        <!-- School & Address Search Selection Box -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <School class="w-3.5 h-3.5 text-slate-400" />
              <span>봉사 학교 / 장소 <strong class="text-rose-500">*</strong></span>
            </span>
            <span v-if="formData.address" class="text-[10px] text-blue-600 font-bold flex items-center gap-1">
              <CheckCircle2 class="w-3 h-3 text-blue-600" />
              <span>선택 완료</span>
            </span>
          </label>

          <!-- State A: Not Selected yet -> Big Friendly Search Button -->
          <div v-if="!formData.address">
            <button
              type="button"
              @click="handleOpenPostcode"
              class="w-full py-6 px-4 bg-blue-50/70 hover:bg-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-2xl text-blue-800 flex flex-col items-center justify-center gap-2 transition active:scale-98 cursor-pointer group shadow-2xs"
            >
              <div class="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
                <Search class="w-6 h-6" />
              </div>
              <div class="text-center">
                <p class="text-sm font-extrabold text-slate-800">학교 / 도로명 주소 검색하기</p>
                <p class="text-[11px] text-slate-500 mt-0.5 font-medium">
                  버튼을 누르면 전국 모든 유치원·초·중·고·건물 주소 검색창이 열립니다
                </p>
              </div>
            </button>
          </div>

          <!-- State B: Selected -> Clean Card with details and Change button -->
          <div
            v-else
            class="p-4 bg-slate-50 border border-blue-200/80 rounded-2xl space-y-2.5 relative"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-extrabold">
                    학교 / 기관명
                  </span>
                  <input
                    v-model="formData.schoolName"
                    type="text"
                    required
                    placeholder="학교/기관명"
                    class="font-black text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
                  />
                </div>
                <div class="flex items-center gap-1.5 text-xs text-slate-600 font-medium pl-1">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{{ formData.address }}</span>
                </div>
              </div>

              <!-- Re-search button -->
              <button
                type="button"
                @click="handleOpenPostcode"
                class="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
              >
                <RotateCcw class="w-3 h-3" />
                <span>주소 변경</span>
              </button>
            </div>

            <!-- Coordinate Status Indicator -->
            <div v-if="formData.latitude && formData.longitude" class="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-xl">
              <CheckCircle2 class="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>지도 좌표 연동 완료 (위도 {{ formData.latitude.toFixed(4) }}, 경도 {{ formData.longitude.toFixed(4) }})</span>
            </div>
          </div>
        </div>

        <!-- Subject Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <BookOpen class="w-3.5 h-3.5 text-slate-400" />
            <span>교육과목 <strong class="text-rose-500">*</strong></span>
          </label>
          <select
            @change="handleSubjectChange"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white mb-2"
          >
            <option
              v-for="sub in subjects"
              :key="sub.id"
              :value="sub.name"
              :selected="formData.subject === sub.name"
            >
              {{ sub.name }}
            </option>
            <option value="__custom__">+ 직접 입력하기</option>
          </select>

          <!-- Custom subject input -->
          <input
            v-if="isCustomSubject"
            v-model="customSubjectText"
            type="text"
            placeholder="과목명 입력 (예: 청소년 금융교육)"
            class="w-full px-3.5 py-3 bg-blue-50/50 border border-blue-300 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Card 2: Date, Time & Personnel -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
        <!-- Date -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            <span>봉사 일자 <strong class="text-rose-500">*</strong></span>
          </label>
          <input
            v-model="formData.date"
            type="date"
            required
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <!-- Time Range Grid -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              <span>시작 시간</span>
            </label>
            <input
              v-model="formData.startTime"
              type="time"
              required
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              <span>종료 시간</span>
            </label>
            <input
              v-model="formData.endTime"
              type="time"
              required
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <!-- Personnel -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Users class="w-3.5 h-3.5 text-slate-400" />
            <span>모집 정원 (명) <strong class="text-rose-500">*</strong></span>
          </label>
          <input
            v-model.number="formData.requiredCount"
            type="number"
            min="1"
            max="50"
            required
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      <!-- Card 3: Class Info & Notes -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Users class="w-3.5 h-3.5 text-slate-400" />
            <span>대상 및 학급 정보</span>
          </label>
          <input
            v-model="formData.classInfo"
            type="text"
            placeholder="예: 5학년 2반 (24명)"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <FileText class="w-3.5 h-3.5 text-slate-400" />
            <span>비고 및 준비사항</span>
          </label>
          <textarea
            v-model="formData.note"
            rows="2"
            placeholder="예: 1층 교무실에서 집결, 교재 배부 예정"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 pt-2">
        <button
          type="button"
          @click="router.back()"
          class="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition cursor-pointer"
        >
          취소
        </button>
        <button
          v-if="isSuperAdmin"
          type="button"
          @click="handleDelete"
          :disabled="isDeleting"
          class="py-3.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          title="일정 영구 삭제 (최고 관리자 전용)"
        >
          <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
          <template v-else>
            <Trash2 class="w-4 h-4 text-rose-500" />
            <span>영구 삭제</span>
          </template>
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="flex-2 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <span v-else>수정사항 저장</span>
        </button>
      </div>
    </form>

  </div>
</template>
