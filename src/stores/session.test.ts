import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionStore } from './session'

describe('useSessionStore (봉사자 세션 및 localStorage 동기화 검증)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('초기 상태에서는 봉사자 로그인이 false여야 한다', () => {
    const store = useSessionStore()
    expect(store.isVolunteerLoggedIn).toBe(false)
    expect(store.volunteerId).toBeNull()
    expect(store.volunteerName).toBeNull()
  })

  it('setVolunteer 호출 시 스토어와 localStorage가 동기화되어야 한다', () => {
    const store = useSessionStore()
    store.setVolunteer('vol-123', '홍길동')

    expect(store.volunteerId).toBe('vol-123')
    expect(store.volunteerName).toBe('홍길동')
    expect(store.isVolunteerLoggedIn).toBe(true)
    expect(localStorage.getItem('dodam_volunteer_id')).toBe('vol-123')
    expect(localStorage.getItem('dodam_volunteer_name')).toBe('홍길동')
  })

  it('clearVolunteer 호출 시 세션 정보가 제거되어야 한다', () => {
    const store = useSessionStore()
    store.setVolunteer('vol-123', '홍길동')
    store.clearVolunteer()

    expect(store.volunteerId).toBeNull()
    expect(store.volunteerName).toBeNull()
    expect(store.isVolunteerLoggedIn).toBe(false)
    expect(localStorage.getItem('dodam_volunteer_id')).toBeNull()
  })

  it('모달 오픈/클로즈 상태가 올바르게 토글되어야 한다', () => {
    const store = useSessionStore()
    expect(store.isVolunteerModalOpen).toBe(false)

    store.openVolunteerModal()
    expect(store.isVolunteerModalOpen).toBe(true)

    store.closeVolunteerModal()
    expect(store.isVolunteerModalOpen).toBe(false)
  })
})
