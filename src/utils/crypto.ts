/**
 * Web Crypto API를 사용한 안전한 SHA-256 비밀번호 단방향 해시 유틸리티
 */
const SALT = 'dodam_volunteer_salt_2026_secure'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password.trim() + '_' + SALT)
  
  // Node.js (Vitest) 및 브라우저 환경 호환
  const subtle = typeof window !== 'undefined' && window.crypto?.subtle
    ? window.crypto.subtle
    : (globalThis.crypto?.subtle)

  if (!subtle) {
    // Fallback if subtle is unavailable
    let hash = 0
    const str = password.trim() + '_' + SALT
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0
    }
    return 'fallback_' + Math.abs(hash).toString(16)
  }

  const hashBuffer = await subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
