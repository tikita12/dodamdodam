import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'entry',
    component: () => import('@/views/EntryView.vue'),
    meta: { title: '도담도담 자원봉사' },
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('@/views/MainView.vue'),
    meta: { title: '일정 캘린더' },
  },
  {
    path: '/schedule/:id',
    name: 'schedule-detail',
    component: () => import('@/views/ScheduleDetailView.vue'),
    meta: { title: '일정 상세' },
  },
  {
    path: '/my-schedules',
    name: 'my-schedules',
    component: () => import('@/views/MySchedulesView.vue'),
    meta: { title: '내 신청 일정' },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { title: '관리자 대시보드', requiresAdmin: true },
  },
  {
    path: '/admin/schedule/new',
    name: 'admin-schedule-new',
    component: () => import('@/views/admin/ScheduleCreateView.vue'),
    meta: { title: '일정 등록', requiresAdmin: true },
  },
  {
    path: '/admin/schedule/:id/edit',
    name: 'admin-schedule-edit',
    component: () => import('@/views/admin/ScheduleEditView.vue'),
    meta: { title: '일정 수정', requiresAdmin: true },
  },
  {
    path: '/admin/volunteers',
    name: 'admin-volunteers',
    component: () => import('@/views/admin/VolunteersView.vue'),
    meta: { title: '자원봉사자 관리', requiresAdmin: true },
  },
  {
    path: '/admin/subjects',
    name: 'admin-subjects',
    component: () => import('@/views/admin/SubjectsView.vue'),
    meta: { title: '교육과목 관리', requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach(async (to, _from, next) => {
  const sessionStore = useSessionStore()

  // 1. Firebase Auth 초기 상태 대기
  if (!sessionStore.isAuthReady) {
    await sessionStore.initAuthListener()
  }

  // 문서 타이틀 업데이트
  if (to.meta.title) {
    document.title = `${to.meta.title} - 도담도담`
  }

  // 2. 관리자 전용 라우트 접근 제어
  if (to.meta.requiresAdmin) {
    if (sessionStore.isAdmin) {
      return next()
    } else {
      return next('/')
    }
  }

  // 3. 최초 진입 화면('/')은 봉사자 선택 및 관리자 로그인 분기점이므로 항상 자유롭게 진입 허용
  if (to.path === '/') {
    return next()
  }

  // 4. 일반 사용자 화면(/main, /schedule/:id, /my-schedules) 접근 시
  // 봉사자 세션도 없고 관리자도 아니면 진입 화면(/)으로 안내
  if (!sessionStore.isVolunteerLoggedIn && !sessionStore.isAdmin) {
    return next('/')
  }

  next()
})
