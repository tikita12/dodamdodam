import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { isAllowedAdminEmail } from '@/utils/admin'

/**
 * 관리자 이메일/비밀번호 정식 Firebase Authentication 로그인
 */
export async function loginAdminWithEmail(email: string, pass: string): Promise<User> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) throw new Error('이메일을 입력해주세요.')
  if (!pass) throw new Error('비밀번호를 입력해주세요.')

  if (!isAllowedAdminEmail(trimmedEmail)) {
    throw new Error('관리자로 등록된 이메일 계정이 아닙니다.')
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

    if (
      errorCode === 'auth/wrong-password' ||
      errorCode === 'auth/invalid-credential' ||
      errorCode === 'auth/invalid-login-credentials'
    ) {
      throw new Error('비밀번호가 올바르지 않습니다. 다시 확인해주세요.')
    }

    if (errorCode === 'auth/user-not-found') {
      throw new Error('Firebase 콘솔에 등록되지 않은 관리자 계정입니다.')
    }

    if (errorCode === 'auth/too-many-requests') {
      throw new Error('연속된 로그인 실패로 일시 차단되었습니다. 잠시 후 다시 시도해주세요.')
    }

    if (err instanceof Error) {
      throw err
    }

    throw new Error('관리자 로그인 인증에 실패했습니다.')
  }
}

/**
 * 관리자 비밀번호 재설정 이메일 발송
 */
export async function sendPasswordResetForAdmin(email: string): Promise<void> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) throw new Error('이메일을 입력해주세요.')

  if (!isAllowedAdminEmail(trimmedEmail)) {
    throw new Error('관리자로 등록된 이메일 계정만 비밀번호를 재설정할 수 있습니다.')
  }

  try {
    await sendPasswordResetEmail(auth, trimmedEmail)
  } catch (err: unknown) {
    const errorCode = (err as { code?: string })?.code
    if (errorCode === 'auth/user-not-found') {
      throw new Error('Firebase 콘솔에 등록되지 않은 관리자 이메일입니다.')
    }
    if (err instanceof Error) {
      throw err
    }
    throw new Error('비밀번호 재설정 이메일 발송에 실패했습니다.')
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
