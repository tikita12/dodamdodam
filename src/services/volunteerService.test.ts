import { describe, it, expect } from 'vitest'
import {
  registerVolunteer,
  loginVolunteer,
  approveVolunteer,
  rejectVolunteer,
  changeVolunteerPassword,
  resetVolunteerPasswordByAdmin,
} from './volunteerService'

describe('volunteerService - 관리자 승인제 워크플로우 & 비밀번호 관리 테스트', () => {
  const testName = `테스트봉사자_${Date.now()}`
  const testPassword = 'pass1234!'

  it('신규 봉사자 가입 신청 시 상태가 pending(승인 대기)이어야 한다', async () => {
    const vol = await registerVolunteer(testName, testPassword)
    expect(vol.name).toBe(testName)
    expect(vol.status).toBe('pending')
  })

  it('승인 대기(pending) 상태에서는 로그인을 시도하면 승인 대기 안내 에러가 발생해야 한다', async () => {
    await expect(loginVolunteer(testName, testPassword)).rejects.toThrow(
      '현재 관리자 승인 대기 중입니다'
    )
  })

  it('관리자가 승인(approveVolunteer)하면 정상적으로 로그인할 수 있어야 한다', async () => {
    const list = await registerVolunteer(`승인테스트_${Date.now()}`, 'pw1234')
    await approveVolunteer(list.id)

    const loggedIn = await loginVolunteer(list.name, 'pw1234')
    expect(loggedIn.name).toBe(list.name)
    expect(loggedIn.status).toBe('approved')
  })

  it('비밀번호가 불일치하면 로그인 에러가 발생해야 한다', async () => {
    const volName = `비번테스트_${Date.now()}`
    const vol = await registerVolunteer(volName, 'correct123')
    await approveVolunteer(vol.id)

    await expect(loginVolunteer(volName, 'wrong123')).rejects.toThrow(
      '비밀번호가 일치하지 않습니다'
    )
  })

  it('봉사자 본인이 비밀번호를 직접 변경할 수 있어야 한다', async () => {
    const changeName = `비번변경_${Date.now()}`
    const vol = await registerVolunteer(changeName, 'oldpass1')
    await approveVolunteer(vol.id)

    await changeVolunteerPassword(vol.id, 'oldpass1', 'newpass2')

    // 새 비밀번호로 로그인 성공
    const logged = await loginVolunteer(changeName, 'newpass2')
    expect(logged.name).toBe(changeName)
  })

  it('관리자가 비밀번호를 강제 초기화/재설정할 수 있어야 한다', async () => {
    const resetName = `비번초기화_${Date.now()}`
    const vol = await registerVolunteer(resetName, 'initpass1')
    await approveVolunteer(vol.id)

    // 관리자가 '9999'로 강제 재설정
    await resetVolunteerPasswordByAdmin(vol.id, '9999')

    const logged = await loginVolunteer(resetName, '9999')
    expect(logged.name).toBe(resetName)
  })

  it('관리자가 반려(rejectVolunteer)하면 반려 에러가 발생해야 한다', async () => {
    const rejectName = `반려테스트_${Date.now()}`
    const vol = await registerVolunteer(rejectName, 'testpass')
    await rejectVolunteer(vol.id)

    await expect(loginVolunteer(rejectName, 'testpass')).rejects.toThrow(
      '반려되었습니다'
    )
  })
})
