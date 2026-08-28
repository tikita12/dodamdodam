import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Unsubscribe } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { isAllowedAdminEmail } from '@/utils/admin'

const STORAGE_VOLUNTEER_ID = 'dodam_volunteer_id'
const STORAGE_VOLUNTEER_NAME = 'dodam_volunteer_name'
const STORAGE_ROLE = 'dodam_current_role'

function getInitialStorage(key: string): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

export const useSessionStore = defineStore('session', () => {
  // 현재 활성 역할 ('volunteer' | 'admin' | null)
  const currentRole = ref<'volunteer' | 'admin' | null>(
    (getInitialStorage(STORAGE_ROLE) as 'volunteer' | 'admin') || null
  )

  // 1. 자원봉사자 세션 (localStorage 연동)
  const volunteerId = ref<string | null>(getInitialStorage(STORAGE_VOLUNTEER_ID))
  const volunteerName = ref<string | null>(getInitialStorage(STORAGE_VOLUNTEER_NAME))

  // 2. 관리자 세션 (Firebase Auth 연동)
  const adminUser = ref<User | null>(null)
  const isAuthReady = ref(false)
  let authUnsubscribe: Unsubscribe | null = null
  let initPromise: Promise<User | null> | null = null

  const isAdmin = computed(() => {
    return currentRole.value === 'admin' && !!adminUser.value && isAllowedAdminEmail(adminUser.value.email)
  })

  // 봉사자 로그인 여부: 관리자 모드가 아닐 때만 봉사자 세션 인정 (완전 분리)
  const isVolunteerLoggedIn = computed(() => {
    return currentRole.value === 'volunteer' && !isAdmin.value && !!volunteerId.value && !!volunteerName.value
  })

  function setVolunteer(id: string, name: string) {
    currentRole.value = 'volunteer'
    volunteerId.value = id
    volunteerName.value = name
    adminUser.value = null // 관리자 세션 해제

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ROLE, 'volunteer')
      localStorage.setItem(STORAGE_VOLUNTEER_ID, id)
      localStorage.setItem(STORAGE_VOLUNTEER_NAME, name)
    }
  }

  function clearVolunteer() {
    volunteerId.value = null
    volunteerName.value = null
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_VOLUNTEER_ID)
      localStorage.removeItem(STORAGE_VOLUNTEER_NAME)
    }
  }

  function setAdminUser(user: User | null) {
    adminUser.value = user
    if (user && isAllowedAdminEmail(user.email)) {
      currentRole.value = 'admin'
      clearVolunteer() // 관리자 모드 진입 시 이전 봉사자 잔여 세션 완전 초기화
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_ROLE, 'admin')
      }
    }
  }

  async function logoutAdmin() {
    try {
      await signOut(auth)
    } catch {}
    adminUser.value = null
    currentRole.value = null
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_ROLE)
    }
  }

  // Firebase Auth 상태 초기 리스너
  function initAuthListener(): Promise<User | null> {
    if (initPromise) return initPromise

    initPromise = new Promise((resolve) => {
      let resolved = false

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true
          isAuthReady.value = true
          resolve(null)
        }
      }, 5000)

      if (authUnsubscribe) authUnsubscribe()

      authUnsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timer)
            if (currentRole.value === 'admin') {
              setAdminUser(user)
            }
            isAuthReady.value = true
            resolve(user)
          } else {
            if (currentRole.value === 'admin') {
              setAdminUser(user)
            }
          }
        },
        (error) => {
          console.error('[SessionStore] Auth state change error:', error)
          if (!resolved) {
            resolved = true
            clearTimeout(timer)
            isAuthReady.value = true
            resolve(null)
          }
        }
      )
    })

    return initPromise
  }

  // 3. UI 모달 상태
  const isVolunteerModalOpen = ref(false)
  const isAdminLoginModalOpen = ref(false)

  function openVolunteerModal() {
    isVolunteerModalOpen.value = true
  }

  function closeVolunteerModal() {
    isVolunteerModalOpen.value = false
  }

  function openAdminLoginModal() {
    isAdminLoginModalOpen.value = true
  }

  function closeAdminLoginModal() {
    isAdminLoginModalOpen.value = false
  }

  return {
    currentRole,
    // 봉사자
    volunteerId,
    volunteerName,
    isVolunteerLoggedIn,
    setVolunteer,
    clearVolunteer,
    // 관리자
    adminUser,
    isAdmin,
    isAuthReady,
    setAdminUser,
    logoutAdmin,
    initAuthListener,
    // 모달
    isVolunteerModalOpen,
    isAdminLoginModalOpen,
    openVolunteerModal,
    closeVolunteerModal,
    openAdminLoginModal,
    closeAdminLoginModal,
  }
})
