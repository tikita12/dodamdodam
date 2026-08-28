/**
 * 관리자 이메일 화이트리스트 중앙 관리 (Single Source of Truth)
 * firestore.rules와 클라이언트에서 일치하도록 최종 기준 2명 유지
 * 1. cwacc@hanmail.net
 * 2. admin2@dodam.com
 */
export const DEFAULT_ADMIN_EMAILS = [
  'cwacc@hanmail.net',
  'admin2@dodam.com',
]

/**
 * 환경변수(VITE_ADMIN_EMAILS) 또는 기본 관리자 이메일 목록 반환 (모두 소문자로 정규화)
 */
export function getAdminEmails(): string[] {
  const envEmails = import.meta.env.VITE_ADMIN_EMAILS
  if (envEmails && typeof envEmails === 'string') {
    return envEmails
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean)
  }
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase())
}

/**
 * 특정 이메일이 관리자인지 여부 확인 (대소문자 무시)
 */
export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  const allowed = getAdminEmails()
  return allowed.includes(normalized)
}
