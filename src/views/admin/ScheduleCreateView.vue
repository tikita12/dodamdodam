<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createSchedule } from '@/services/scheduleService'
import { subscribeSubjects } from '@/services/subjectService'
import type { Subject, ScheduleFormData } from '@/types'
import {
  CalendarPlus,
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
} from '@lucide/vue'
import dayjs from 'dayjs'
import { findSchoolPreset, searchSchoolPresets, type SchoolPreset } from '@/utils/schoolPresets'

const router = useRouter()

const formData = ref<ScheduleFormData>({
  schoolName: '',
  subject: '',
  date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  startTime: '09:50',
  endTime: '10:30',
  address: '',
  latitude: undefined,
  longitude: undefined,
  requiredCount: 3,
  classInfo: '',
  note: '',
})

const showSchoolSuggestions = ref(false)
const schoolSuggestions = computed(() => {
  return searchSchoolPresets(formData.value.schoolName)
})

function selectSchoolPreset(preset: SchoolPreset) {
  formData.value.schoolName = preset.name
  formData.value.address = preset.address
  formData.value.latitude = preset.lat
  formData.value.longitude = preset.lng
  showSchoolSuggestions.value = false
}

// 사용자가 학교명을 입력/변경할 때 주소 및 좌표 실시간 동기화
function handleSchoolNameInput() {
  const trimmed = formData.value.schoolName.trim()
  if (!trimmed) {
    formData.value.address = ''
    formData.value.latitude = undefined
    formData.value.longitude = undefined
    return
  }

  showSchoolSuggestions.value = true

  const preset = findSchoolPreset(trimmed)
  if (preset) {
    formData.value.address = preset.address
    formData.value.latitude = preset.lat
    formData.value.longitude = preset.lng
  } else {
    // 새로운 학교명 입력 시 이전 학교의 주소가 남지 않도록 즉시 갱신
    formData.value.address = trimmed
    formData.value.latitude = undefined
    formData.value.longitude = undefined
  }
}

const subjects = ref<Subject[]>([])
const isCustomSubject = ref(false)
const customSubjectText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// 카카오 장소 검색 보조
const searchAddressKeyword = ref('')
const searchResults = ref<{ placeName: string; addressName: string; lat: number; lng: number }[]>([])
const isSearchingPlace = ref(false)

let unsubscribeSubjects: (() => void) | null = null

onMounted(() => {
  unsubscribeSubjects = subscribeSubjects((list) => {
    subjects.value = list
    if (list.length > 0 && !formData.value.subject) {
      formData.value.subject = list[0].name
    }
  })
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

// 카카오 장소 키워드 검색
function searchKakaoPlaces() {
  const q = searchAddressKeyword.value.trim()
  if (!q) return

  const kakao = (window as unknown as {
    kakao?: {
      maps?: {
        services?: {
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (result: Array<{ place_name: string; address_name: string; road_address_name: string; y: string; x: string }>, status: string) => void
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }).kakao

  if (!kakao?.maps?.services?.Places) {
    formData.value.address = q
    searchResults.value = []
    return
  }

  isSearchingPlace.value = true
  const ps = new kakao.maps.services.Places()
  ps.keywordSearch(q, (data, status) => {
    isSearchingPlace.value = false
    if (status === kakao.maps!.services!.Status.OK) {
      searchResults.value = data.slice(0, 5).map((item) => ({
        placeName: item.place_name,
        addressName: item.road_address_name || item.address_name,
        lat: parseFloat(item.y),
        lng: parseFloat(item.x),
      }))
    } else {
      searchResults.value = []
    }
  })
}

function selectPlace(place: { placeName: string; addressName: string; lat: number; lng: number }) {
  formData.value.address = `${place.addressName} (${place.placeName})`
  formData.value.latitude = place.lat
  formData.value.longitude = place.lng
  if (!formData.value.schoolName) {
    formData.value.schoolName = place.placeName
  }
  searchResults.value = []
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

  isLoading.value = true
  try {
    await createSchedule(formData.value)
    router.push('/admin')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '일정 등록 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
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
      <div class="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
        <CalendarPlus class="w-5 h-5" />
      </div>
      <div>
        <h2 class="text-base font-black text-slate-900 tracking-tight">새 봉사 일정 등록</h2>
        <p class="text-xs text-slate-400">학교명을 입력하면 주소가 자동으로 입력됩니다</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Form Container (엔터키 자동 제출 방지) -->
    <form @submit.prevent="handleSubmit" @keydown.enter="handleFormKeyDown" class="space-y-4">
      
      <!-- Card 1: School & Subject -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
        <!-- School Name with Autocomplete Dropdown -->
        <div class="relative">
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <School class="w-3.5 h-3.5 text-slate-400" />
              <span>학교/유치원명 <strong class="text-rose-500">*</strong></span>
            </span>
            <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <Sparkles class="w-3 h-3 fill-emerald-600" /> 주소 실시간 연동
            </span>
          </label>
          <input
            v-model="formData.schoolName"
            @input="handleSchoolNameInput"
            @focus="showSchoolSuggestions = true"
            type="text"
            required
            placeholder="예: 봉림초등학교 또는 가람유치원"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />

          <!-- Quick School Suggestions Dropdown -->
          <div
            v-if="showSchoolSuggestions && schoolSuggestions.length > 0"
            class="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-emerald-200 rounded-2xl shadow-xl p-2 space-y-1 max-h-48 overflow-y-auto"
          >
            <div class="px-2 py-1 text-[10px] font-bold text-emerald-700 flex items-center justify-between border-b border-slate-100">
              <span>💡 추천 학교/유치원 (클릭 시 주소 자동완성)</span>
              <button type="button" @mousedown.prevent="showSchoolSuggestions = false" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <button
              v-for="preset in schoolSuggestions"
              :key="preset.name"
              type="button"
              @mousedown.prevent="selectSchoolPreset(preset)"
              class="w-full p-2 text-left hover:bg-emerald-50 rounded-xl text-xs transition flex flex-col gap-0.5 cursor-pointer"
            >
              <div class="font-bold text-slate-900 flex items-center justify-between">
                <span>{{ preset.name }}</span>
                <span class="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">선택</span>
              </div>
              <span class="text-[10px] text-slate-500 truncate">{{ preset.address }}</span>
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
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white mb-2"
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
            class="w-full px-3.5 py-3 bg-emerald-50/50 border border-emerald-300 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
              class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      <!-- Card 3: Address & Auto-Filled Location -->
      <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5 text-emerald-600" />
              <span>봉사 장소 주소 <strong class="text-rose-500">*</strong></span>
            </span>
            <span class="text-[10px] text-slate-400">직접 수정도 가능</span>
          </label>

          <!-- Place search input -->
          <div class="flex gap-1.5 mb-2">
            <div class="relative flex-1">
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchAddressKeyword"
                type="text"
                placeholder="다른 장소명 검색 (예: 창원 봉림초)"
                @keydown.enter.prevent.stop="searchKakaoPlaces"
                class="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              @click="searchKakaoPlaces"
              class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer"
            >
              검색
            </button>
          </div>

          <!-- Search results list dropdown -->
          <div
            v-if="searchResults.length > 0"
            class="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 max-h-36 overflow-y-auto"
          >
            <button
              v-for="(item, idx) in searchResults"
              :key="idx"
              type="button"
              @click="selectPlace(item)"
              class="w-full p-2 text-left bg-white hover:bg-emerald-50 rounded-xl text-xs border border-slate-100 transition block cursor-pointer"
            >
              <p class="font-bold text-slate-900">{{ item.placeName }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ item.addressName }}</p>
            </button>
          </div>

          <!-- Full Address Field (자동 입력됨) -->
          <input
            v-model="formData.address"
            type="text"
            required
            placeholder="학교명을 입력하면 주소가 자동 입력됩니다"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
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
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
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
          :disabled="isLoading"
          class="flex-2 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <span v-else>일정 등록 완료</span>
        </button>
      </div>
    </form>

  </div>
</template>
