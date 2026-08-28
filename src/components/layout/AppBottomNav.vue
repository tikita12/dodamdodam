<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { Home, CalendarCheck2, Shield, CalendarDays } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

// 진입 화면에서는 하단 바 숨김
const isEntryView = computed(() => route.path === '/')

const isHomeActive = computed(() => {
  return route.path === '/main' || route.path.startsWith('/schedule/')
})

const isMySchedulesActive = computed(() => {
  return route.path === '/my-schedules'
})

const isAdminActive = computed(() => {
  return route.path.startsWith('/admin')
})

function handleNavigate(type: 'home' | 'my' | 'admin') {
  if (type === 'home') {
    router.push('/main')
  } else if (type === 'my') {
    if (sessionStore.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/my-schedules')
    }
  } else if (type === 'admin') {
    if (sessionStore.isAdmin) {
      router.push('/admin')
    } else {
      sessionStore.openAdminLoginModal()
    }
  }
}
</script>

<template>
  <nav
    v-if="!isEntryView"
    class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 max-w-md mx-auto px-4 py-2 flex items-center justify-around shadow-lg shadow-slate-900/5 select-none"
  >
    <!-- 1. 홈 탭 -->
    <button
      type="button"
      @click="handleNavigate('home')"
      :class="[
        'flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all active:scale-95 cursor-pointer',
        isHomeActive ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'
      ]"
    >
      <div
        :class="[
          'w-10 h-7 rounded-full flex items-center justify-center transition-all',
          isHomeActive ? 'bg-emerald-50 text-emerald-600' : ''
        ]"
      >
        <Home :class="['w-5 h-5', isHomeActive ? 'stroke-[2.5]' : 'stroke-2']" />
      </div>
      <span class="text-[11px] leading-tight">홈</span>
    </button>

    <!-- 2. 일정 탭 (관리자는 전체 관리일정, 봉사자는 내 신청 일정) -->
    <button
      type="button"
      @click="handleNavigate('my')"
      :class="[
        'flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all active:scale-95 cursor-pointer',
        (sessionStore.isAdmin ? isAdminActive : isMySchedulesActive) ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'
      ]"
    >
      <div
        :class="[
          'w-10 h-7 rounded-full flex items-center justify-center transition-all',
          (sessionStore.isAdmin ? isAdminActive : isMySchedulesActive) ? 'bg-emerald-50 text-emerald-600' : ''
        ]"
      >
        <component
          :is="sessionStore.isAdmin ? CalendarDays : CalendarCheck2"
          :class="['w-5 h-5', (sessionStore.isAdmin ? isAdminActive : isMySchedulesActive) ? 'stroke-[2.5]' : 'stroke-2']"
        />
      </div>
      <span class="text-[11px] leading-tight">{{ sessionStore.isAdmin ? '전체일정' : '내 일정' }}</span>
    </button>

    <!-- 3. 관리자 탭 -->
    <button
      type="button"
      @click="handleNavigate('admin')"
      :class="[
        'flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all active:scale-95 cursor-pointer',
        isAdminActive ? 'text-amber-700 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'
      ]"
    >
      <div
        :class="[
          'w-10 h-7 rounded-full flex items-center justify-center transition-all',
          isAdminActive ? 'bg-amber-50 text-amber-600' : ''
        ]"
      >
        <Shield :class="['w-5 h-5', isAdminActive ? 'stroke-[2.5]' : 'stroke-2']" />
      </div>
      <span class="text-[11px] leading-tight">관리자</span>
    </button>
  </nav>
</template>
