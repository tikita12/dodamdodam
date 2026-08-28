<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { subscribeVolunteers } from '@/services/volunteerService'
import type { Volunteer } from '@/types'
import {
  HeartHandshake,
  Sparkles,
  UserCheck,
  Search,
  ChevronDown,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Mail,
} from '@lucide/vue'

const router = useRouter()
const sessionStore = useSessionStore()

const volunteers = ref<Volunteer[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const selectedVolunteerId = ref('')
const isDropdownOpen = ref(false)
const searchQuery = ref('')
const dropdownContainerRef = ref<HTMLElement | null>(null)

let unsubscribe: (() => void) | null = null

function fetchVolunteers() {
  loadError.value = null

  if (unsubscribe) unsubscribe()

  unsubscribe = subscribeVolunteers(
    (list) => {
      volunteers.value = list
      isLoading.value = false
    },
    (err) => {
      isLoading.value = false
      console.warn('[EntryView] 봉사자 목록 로드 알림:', err)
    }
  )
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    searchQuery.value = ''
  }
}

function handleGlobalClick(e: MouseEvent) {
  if (isDropdownOpen.value && dropdownContainerRef.value) {
    if (!dropdownContainerRef.value.contains(e.target as Node)) {
      isDropdownOpen.value = false
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  fetchVolunteers()
  window.addEventListener('click', handleGlobalClick)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  window.removeEventListener('click', handleGlobalClick)
  window.removeEventListener('keydown', handleKeyDown)
})

const filteredVolunteers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return volunteers.value
  return volunteers.value.filter((v) => v.name.toLowerCase().includes(q))
})

const selectedVolunteer = computed(() => {
  return volunteers.value.find((v) => v.id === selectedVolunteerId.value)
})

function handleSelect(v: Volunteer) {
  selectedVolunteerId.value = v.id
  searchQuery.value = ''
  isDropdownOpen.value = false
}

function handleEnter() {
  if (!selectedVolunteer.value) return
  sessionStore.setVolunteer(selectedVolunteer.value.id, selectedVolunteer.value.name)
  router.push('/main')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-between bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 p-6 min-h-[calc(100vh-60px)]">
    <!-- Main Center Hero & Selector -->
    <div class="flex-1 flex flex-col justify-center items-center text-center my-auto py-6">
      
      <!-- Brand Mascot Badge -->
      <div class="relative mb-5">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-500/25">
          <HeartHandshake class="w-10 h-10" />
        </div>
        <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-amber-900 text-xs shadow-sm">
          <Sparkles class="w-3.5 h-3.5 fill-amber-900" />
        </div>
      </div>

      <!-- Title & Description -->
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">도담도담</h2>
      <p class="text-xs font-bold text-emerald-700 mt-0.5">자원봉사 일정관리 시스템</p>
      <p class="text-xs text-slate-500 mt-2 max-w-[260px] leading-relaxed">
        원활한 봉사 활동 참여를 위해<br />
        <span class="font-bold text-slate-800">본인의 이름</span>을 선택해주세요.
      </p>

      <!-- Volunteer Selector Card -->
      <div class="w-full mt-6 bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 text-left space-y-4">
        
        <!-- Error Alert -->
        <div
          v-if="loadError"
          class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex flex-col gap-2"
        >
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span class="font-medium leading-relaxed">{{ loadError }}</span>
          </div>
          <button
            type="button"
            @click="fetchVolunteers"
            class="self-end px-3 py-1 bg-white border border-rose-200 rounded-lg text-[11px] font-bold text-rose-700 flex items-center gap-1 hover:bg-rose-100 transition"
          >
            <RotateCcw class="w-3 h-3" /> 다시 시도
          </button>
        </div>

        <div>
          <label class="block text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
            <UserCheck class="w-4 h-4 text-emerald-600" />
            <span>자원봉사자 이름 선택</span>
          </label>

          <!-- Custom Searchable Dropdown Container -->
          <div ref="dropdownContainerRef" class="relative">
            <button
              type="button"
              @click="toggleDropdown"
              class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl p-3.5 pr-10 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500 transition active:scale-99 cursor-pointer"
            >
              <span v-if="selectedVolunteer" class="text-slate-900 font-extrabold text-sm">
                {{ selectedVolunteer.name }}
              </span>
              <span v-else-if="isLoading && volunteers.length === 0" class="text-slate-400 flex items-center gap-2">
                <Loader2 class="w-3.5 h-3.5 animate-spin" /> 목록 불러오는 중...
              </span>
              <span v-else class="text-slate-400 font-medium">
                이름을 선택하세요 ({{ volunteers.length }}명 등록됨)
              </span>
              <ChevronDown
                :class="[
                  'w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200',
                  isDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                ]"
              />
            </button>

            <!-- Dropdown Menu Layer -->
            <div
              v-if="isDropdownOpen"
              class="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150"
            >
              <!-- Search bar inside dropdown -->
              <div class="relative">
                <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="이름 검색..."
                  class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  @click.stop
                />
              </div>

              <!-- Options List -->
              <div class="max-h-48 overflow-y-auto space-y-1 pr-1">
                <div v-if="volunteers.length === 0" class="text-center py-4 text-xs text-slate-400">
                  등록된 자원봉사자가 없습니다.
                </div>
                <div v-else-if="filteredVolunteers.length === 0" class="text-center py-4 text-xs text-slate-400">
                  검색 결과가 없습니다.
                </div>
                <button
                  v-for="v in filteredVolunteers"
                  :key="v.id"
                  type="button"
                  @click="handleSelect(v)"
                  :class="[
                    'w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-left transition cursor-pointer',
                    selectedVolunteerId === v.id
                      ? 'bg-emerald-500 text-white'
                      : 'hover:bg-emerald-50 text-slate-700'
                  ]"
                >
                  <span>{{ v.name }}</span>
                  <span v-if="selectedVolunteerId === v.id" class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">선택됨</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Enter Action Button -->
        <button
          type="button"
          @click="handleEnter"
          :disabled="!selectedVolunteerId"
          class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <span>일정 확인 및 입장하기</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

    </div>

    <!-- Bottom Footer: Admin Link & Developer Contact -->
    <div class="text-center py-3 border-t border-slate-200/60 mt-auto space-y-2">
      <div>
        <button
          type="button"
          @click="sessionStore.openAdminLoginModal"
          class="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Shield class="w-3.5 h-3.5 text-amber-500" />
          <span>관리자 로그인</span>
        </button>
      </div>
      <div class="text-[11px] text-slate-400 font-medium">
        <span>개발자 문의: </span>
        <a
          href="mailto:bshine530@gmail.com"
          class="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-2 transition inline-flex items-center gap-1 cursor-pointer"
          title="개발자에게 이메일 보내기"
        >
          <Mail class="w-3 h-3 inline" />
          <span>bshine530@gmail.com</span>
        </a>
      </div>
    </div>
  </div>
</template>
