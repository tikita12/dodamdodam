import { describe, it, expect, vi } from 'vitest'
import {
  registerVolunteer,
  loginVolunteer,
  approveVolunteer,
  rejectVolunteer,
  changeVolunteerPassword,
  resetVolunteerPasswordByAdmin,
  DEFAULT_INIT_PASSWORD,
} from './volunteerService'

let counter = 0
// Firebase Firestore mock to run tests completely in-memory without remote network calls
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore')
  return {
    ...actual,
    addDoc: vi.fn().mockImplementation(async () => {
      counter++
      return { id: `mock-doc-${counter}-${Math.random().toString(36).slice(2)}` }
    }),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    onSnapshot: vi.fn().mockReturnValue(() => {}),
  }
})

describe('volunteerService - 관리자 승인제 & 단방향 해시 암호화 테스트', () => {
  it('신규 봉사자 가입 신청 시 상태가 pending(승인 대기)이어야 하고 비밀번호는 해시되어야 한다', async () => {
    const testName = `신규테스트_${Date.now()}_1`
    const testPassword = 'pass1234!'
    const vol = await registerVolunteer(testName, testPassword)
    expect(vol.name).toBe(testName)
    expect(vol.status).toBe('pending')
    expect(vol.passwordHash).toBeDefined()
    expect(vol.passwordHash).not.toBe(testPassword)
  })

  it('승인 대기(pending) 상태에서는 로그인을 시도하면 승인 대기 안내 에러가 발생해야 한다', async () => {
    const testName = `대기테스트_${Date.now()}_2`
    const testPassword = 'pass1234!'
    await registerVolunteer(testName, testPassword)
    await expect(loginVolunteer(testName, testPassword)).rejects.toThrow(
      '현재 관리자 승인 대기 중입니다'
    )
  })

  it('관리자가 승인(approveVolunteer)하면 정상적으로 로그인할 수 있어야 한다', async () => {
    const testName = `승인테스트_${Date.now()}_3`
    const vol = await registerVolunteer(testName, 'pw1234')
    await approveVolunteer(vol.id)

    const loggedIn = await loginVolunteer(testName, 'pw1234')
    expect(loggedIn.name).toBe(testName)
    expect(loggedIn.status).toBe('approved')
  })

  it('비밀번호가 불일치하면 로그인 에러가 발생해야 한다', async () => {
    const volName = `비번테스트_${Date.now()}_4`
    const vol = await registerVolunteer(volName, 'correct123')
    await approveVolunteer(vol.id)

    await expect(loginVolunteer(volName, 'wrong123')).rejects.toThrow(
      '비밀번호가 일치하지 않습니다'
    )
  })

  it('기본 15인 봉사자는 초기 공통 비밀번호(0000)로 로그인할 수 있어야 한다', async () => {
    const loggedIn = await loginVolunteer('장보윤', DEFAULT_INIT_PASSWORD)
    expect(loggedIn.name).toBe('장보윤')
  })

  it('봉사자 본인이 비밀번호를 직접 변경할 수 있어야 한다', async () => {
    const changeName = `비번변경_${Date.now()}_5`
    const vol = await registerVolunteer(changeName, 'oldpass1')
    await approveVolunteer(vol.id)

    await changeVolunteerPassword(vol.id, 'oldpass1', 'newpass2')

    // 새 비밀번호로 로그인 성공
    const logged = await loginVolunteer(changeName, 'newpass2')
    expect(logged.name).toBe(changeName)
  })

  it('관리자가 비밀번호를 강제 초기화/재설정할 수 있어야 한다', async () => {
    const resetName = `비번초기화_${Date.now()}_6`
    const vol = await registerVolunteer(resetName, 'initpass1')
    await approveVolunteer(vol.id)

    // 관리자가 '9999'로 강제 재설정
    await resetVolunteerPasswordByAdmin(vol.id, '9999')

    const logged = await loginVolunteer(resetName, '9999')
    expect(logged.name).toBe(resetName)
  })

  it('관리자가 반려(rejectVolunteer)하면 반려 에러가 발생해야 한다', async () => {
    const rejectName = `반려테스트_${Date.now()}_7`
    const vol = await registerVolunteer(rejectName, 'testpass')
    await rejectVolunteer(vol.id)

    await expect(loginVolunteer(rejectName, 'testpass')).rejects.toThrow(
      '반려되었습니다'
    )
  })
})
