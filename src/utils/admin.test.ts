import { describe, it, expect } from 'vitest'
import { isAllowedAdminEmail, getAdminEmails } from './admin'

describe('admin utility tests (관리자 이메일 2명 최종 기준 검증)', () => {
  it('getAdminEmails: 등록된 2명의 관리자 이메일 목록을 소문자로 반환해야 한다', () => {
    const emails = getAdminEmails()
    expect(emails).toHaveLength(2)
    expect(emails).toContain('cwacc@hanmail.net')
    expect(emails).toContain('admin2@dodam.com')
  })

  it('isAllowedAdminEmail: 대소문자에 관계없이 허용된 관리자 2명인지 정확히 판별해야 한다', () => {
    expect(isAllowedAdminEmail('cwacc@hanmail.net')).toBe(true)
    expect(isAllowedAdminEmail('CWACC@HANMAIL.NET')).toBe(true)
    expect(isAllowedAdminEmail('admin2@dodam.com')).toBe(true)
    expect(isAllowedAdminEmail('ADMIN2@DODAM.COM')).toBe(true)

    // 비허용 이메일
    expect(isAllowedAdminEmail('bshine530@gmail.com')).toBe(false)
    expect(isAllowedAdminEmail('hacker@example.com')).toBe(false)
    expect(isAllowedAdminEmail('')).toBe(false)
    expect(isAllowedAdminEmail(null)).toBe(false)
    expect(isAllowedAdminEmail(undefined)).toBe(false)
  })
})
