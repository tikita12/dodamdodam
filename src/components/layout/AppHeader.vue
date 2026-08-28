<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { ArrowLeft, Shield, LogOut, Sprout } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

// 진입 화면 판별
const isEntryView = computed(() => route.path === '/')
const isMainView = computed(() => route.path === '/main')
const isAdminDashboard = computed(() => route.path === '/admin')

// 뒤로가기 버튼 노출 여부: 진입 화면(/), 메인(/main), 관리자 메인(/admin)을 제외한 하위 상세/등록 화면에서 노출
const showBackButton = computed(() => !isEntryView.value && !isMainView.value && !isAdminDashboard.value)

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(sessionStore.isAdmin ? '/admin' : '/main')
  }
}

async function handleAdminLogout() {
  await sessionStore.logoutAdmin()
  router.push('/')
}
</script>

<template>
  <header
    v-if="!isEntryView"
    class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between transition-all"
  >
    <!-- Left Section: Logo (항상 최초 선택 화면 '/'으로 이동) -->
    <div class="flex items-center gap-2">
      <button
        v-if="showBackButton"
        type="button"
        @click="handleBack"
        class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition cursor-pointer mr-0.5"
        title="뒤로가기"
      >
        <ArrowLeft class="w-4 h-4" />
      </button>

      <router-link
        to="/"
        class="flex items-center gap-2 group cursor-pointer"
        title="첫 화면(봉사자/관리자 선택)으로 이동"
      >
        <div class="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
          <Sprout class="w-4 h-4" />
        </div>
        <div>
          <h1 class="text-sm font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition">도담도담</h1>
          <p class="text-[9px] font-semibold text-emerald-600">자원봉사 일정관리</p>
        </div>
      </router-link>
    </div>

    <!-- Right Section: Admin or Volunteer Session Badge (완벽 분리) -->
    <div class="flex items-center gap-2">
      <!-- 1. 관리자 모드: 관리자 배지 및 로그아웃만 표시 (봉사자 이름 미노출) -->
      <template v-if="sessionStore.isAdmin">
        <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <Shield class="w-3 h-3 text-amber-500" />
          <span>관리자</span>
        </span>
        <button
          type="button"
          @click="handleAdminLogout"
          class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
          title="관리자 로그아웃"
        >
          <LogOut class="w-3.5 h-3.5" />
        </button>
      </template>

      <!-- 2. 봉사자 모드: 봉사자 이름 고정 배지 표시 (수정 불가) -->
      <template v-else-if="sessionStore.isVolunteerLoggedIn">
        <div
          class="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black select-none shadow-2xs"
          title="현재 활동 봉사자"
        >
          <span>{{ sessionStore.volunteerName }}</span>
        </div>
      </template>
    </div>
  </header>
</template>
