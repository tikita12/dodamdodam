<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getScheduleById, updateSchedule } from '@/services/scheduleService'
import { subscribeSubjects } from '@/services/subjectService'
import { searchPlacesLive, geocodeAddress, openDaumPostcodePopup, type PlaceSearchResult } from '@/services/addressService'
import { queryKoreaSchoolsDB } from '@/services/koreaSchoolsData'
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
  Sparkles,
  CheckCircle2,
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

// 실시간 전국 학교/장소 검색 상태
const liveSchoolResults = ref<PlaceSearchResult[]>([])
const isSearchingSchool = ref(false)
const showSchoolDropdown = ref(false)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// 학교명 입력/변경 시 실시간 도로명 주소 & 좌표 자동 검색 (전국 모든 학교 지원)
function handleSchoolNameInput() {
  const trimmed = formData.value.schoolName.trim()
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)

  if (!trimmed || trimmed.length < 2) {
    liveSchoolResults.value = []
    showSchoolDropdown.value = false
    return
  }

  showSchoolDropdown.value = true

  // 1. 0.001초 만에 즉시 로컬 인덱스(곰내유치원 등)를 먼저 드롭다운과 주소에 채움
  const local = queryKoreaSchoolsDB(trimmed)
  if (local.length > 0) {
    liveSchoolResults.value = local.map((item) => ({
      name: item.name,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
    }))
    const first = local[0]
    formData.value.address = first.address
    formData.value.latitude = first.lat
    formData.value.longitude = first.lng
  }

  isSearchingSchool.value = true

  // 2. 백그라운드에서 실시간 온라인 지오코더를 실행하여 최신 결과 병합
  searchDebounceTimer = setTimeout(async () => {
    try {
      const results = await searchPlacesLive(trimmed)
      if (results.length > 0) {
        liveSchoolResults.value = results
        const first = results[0]
        formData.value.address = first.address
        formData.value.latitude = first.lat
        formData.value.longitude = first.lng
      } else if (local.length === 0) {
        formData.value.address = trimmed
        formData.value.latitude = undefined
        formData.value.longitude = undefined
      }
    } catch {
      if (local.length === 0) {
        liveSchoolResults.value = []
      }
    } finally {
      isSearchingSchool.value = false
    }
  }, 250)
}

function selectLivePlace(place: PlaceSearchResult) {
  formData.value.schoolName = place.name
  formData.value.address = place.address
  formData.value.latitude = place.lat
  formData.value.longitude = place.lng
  showSchoolDropdown.value = false
}

// 다음 공식 우편번호 및 도로명 주소 팝업 실행
async function handleOpenPostcode() {
  try {
    await openDaumPostcodePopup((result) => {
      const fullAddr = result.buildingName
        ? `${result.roadAddress} (${result.buildingName})`
        : result.roadAddress

      formData.value.address = fullAddr
      if (result.lat && result.lng) {
        formData.value.latitude = result.lat
        formData.value.longitude = result.lng
      }
      if (result.buildingName && !formData.value.schoolName) {
        formData.value.schoolName = result.buildingName
      }
    })
  } catch (err) {
    alert(err instanceof Error ? err.message : '주소 검색을 불러오지 못했습니다.')
  }
}

// 주소창 수동 변경 시 자동 좌표 지오코딩
async function handleAddressBlur() {
  const addr = formData.value.address.trim()
  if (!addr) return

  const coords = await geocodeAddress(addr)
  if (coords) {
    formData.value.latitude = coords.lat
    formData.value.longitude = coords.lng
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

  if (isCustomSubject.value) {
    if (!customSubjectText.value.trim()) {
      errorMessage.value = '과목명을 직접 입력해주세요.'
      return
    }
    formData.value.subject = customSubjectText.value.trim()
  }

  // 좌표가 없는 경우 주소 기반 지오코딩 최종 확인
  if (!formData.value.latitude && formData.value.address) {
    const coords = await geocodeAddress(formData.value.address)
    if (coords) {
      formData.value.latitude = coords.lat
      formData.value.longitude = coords.lng
    }
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
        <p class="text-xs text-slate-400">전국 모든 학교명을 입력하면 도로명 주소와 지도 좌표가 자동 매칭됩니다</p>
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

    <!-- Form Container (엔터키 자동 제출 방지) -->
    <form v-else @submit.prevent="handleSubmit" @keydown.enter="handleFormKeyDown" class="space-y-4">
      
      <!-- Card 1: School & Subject -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
        <!-- School Name with Live Autocomplete -->
        <div class="relative">
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <School class="w-3.5 h-3.5 text-slate-400" />
              <span>학교/유치원명 <strong class="text-rose-500">*</strong></span>
            </span>
            <span class="text-[10px] text-blue-600 font-bold flex items-center gap-1">
              <Sparkles class="w-3 h-3 fill-blue-600" />
              <span>도로명 주소 & 좌표 실시간 매칭</span>
            </span>
          </label>
          <div class="relative">
            <input
              v-model="formData.schoolName"
              @input="handleSchoolNameInput"
              @focus="liveSchoolResults.length > 0 && (showSchoolDropdown = true)"
              type="text"
              required
              placeholder="전국 학교/유치원명 입력 (예: 봉림초, 해남서초등학교, 감계초등)"
              class="w-full pl-3.5 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <div v-if="isSearchingSchool" class="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 class="w-4 h-4 animate-spin text-blue-600" />
            </div>
          </div>

          <!-- Real-Time Search Results Dropdown -->
          <div
            v-if="showSchoolDropdown && liveSchoolResults.length > 0"
            class="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-blue-200 rounded-2xl shadow-xl p-2 space-y-1 max-h-56 overflow-y-auto"
          >
            <div class="px-2 py-1 text-[10px] font-bold text-blue-700 flex items-center justify-between border-b border-slate-100">
              <span>🔍 전국 실시간 검색 결과 (클릭 시 도로명 주소/좌표 자동완성)</span>
              <button type="button" @mousedown.prevent="showSchoolDropdown = false" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <button
              v-for="(item, idx) in liveSchoolResults"
              :key="idx"
              type="button"
              @mousedown.prevent="selectLivePlace(item)"
              class="w-full p-2.5 text-left hover:bg-blue-50 rounded-xl text-xs transition flex flex-col gap-0.5 cursor-pointer border border-transparent hover:border-blue-100"
            >
              <div class="font-bold text-slate-900 flex items-center justify-between">
                <span>{{ item.name }}</span>
                <span class="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-md">선택</span>
              </div>
              <span class="text-[10px] text-slate-500 truncate">{{ item.address }}</span>
            </button>
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
            <option value="__custom__" :selected="isCustomSubject">+ 직접 입력하기</option>
          </select>

          <!-- Custom subject input -->
          <input
            v-if="isCustomSubject"
            v-model="customSubjectText"
            type="text"
            placeholder="과목명 입력"
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

      <!-- Card 3: Address & Coordinates -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5 text-blue-600" />
              <span>봉사 장소 도로명 주소 <strong class="text-rose-500">*</strong></span>
            </label>

            <!-- Daum Postcode Search Button -->
            <button
              type="button"
              @click="handleOpenPostcode"
              class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Search class="w-3 h-3" />
              <span>도로명 주소 검색</span>
            </button>
          </div>

          <!-- Full Address Field -->
          <input
            v-model="formData.address"
            @blur="handleAddressBlur"
            type="text"
            required
            placeholder="학교명을 입력하면 도로명 주소가 자동으로 완성됩니다"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />

          <!-- Coordinate Status Indicator -->
          <div class="mt-2 flex items-center gap-1.5 text-[11px] font-medium">
            <span v-if="formData.latitude && formData.longitude" class="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 class="w-3 h-3 text-blue-600 shrink-0" />
              <span>지도 좌표 연동됨 (위도 {{ formData.latitude.toFixed(4) }}, 경도 {{ formData.longitude.toFixed(4) }})</span>
            </span>
            <span v-else class="text-slate-400">
              📍 학교명 또는 주소 입력 시 지도 좌표가 자동으로 매칭됩니다.
            </span>
          </div>
        </div>
      </div>

      <!-- Card 4: Class Info & Notes -->
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
          type="submit"
          :disabled="isSaving"
          class="flex-2 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <span v-else>수정사항 저장</span>
        </button>
      </div>
    </form>

  </div>
</template>
