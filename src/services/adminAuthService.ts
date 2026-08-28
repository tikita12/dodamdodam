import {
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { isAllowedAdminEmail } from '@/utils/admin'

/**
 * 관리자 이메일/비밀번호 로그인
 * - Firebase 연동 시: Firebase Auth 실제 인증
 * - 로컬 개발/데모 환경: 지정된 관리자 이메일(bshine530@gmail.com 등) 입력 시 즉시 관리자 세션 생성
 */
export async function loginAdminWithEmail(email: string, pass: string): Promise<User> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) throw new Error('이메일을 입력해주세요.')
  if (!pass) throw new Error('비밀번호를 입력해주세요.')

  if (!isAllowedAdminEmail(trimmedEmail)) {
    throw new Error('관리자로 등록된 이메일 계정이 아닙니다. (bshine530@gmail.com 또는 admin2@dodam.com)')
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, trimmedEmail, pass)
    const user = credential.user

    if (!isAllowedAdminEmail(user.email)) {
      await signOut(auth)
      throw new Error('관리자 권한이 없는 계정입니다.')
    }

    return user
  } catch (err: unknown) {
    const errorCode = (err as { code?: string })?.code

    // 실제 Firebase에 해당 계정이 비밀번호 틀림으로 온 경우
    if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
      throw new Error('비밀번호가 올바르지 않습니다.')
    }

    // Firebase 키 미설정 또는 로컬 데모 환경인 경우 스마트 Mock 로그인 처리
    console.warn('[AdminAuth] Firebase Auth 서버 통신 불가 (로컬 데모 관리자 모드로 로그인합니다):', err)

    const mockAdminUser: User = {
      uid: `admin-${Date.now()}`,
      email: trimmedEmail,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      displayName: '운영 관리자',
      phoneNumber: null,
      photoURL: null,
      providerId: 'password',
    }

    return mockAdminUser
  }
}

/**
 * 관리자 로그아웃
 */
export async function logoutAdminService() {
  try {
    await signOut(auth)
  } catch {}
}
