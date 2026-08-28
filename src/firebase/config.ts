import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const isTestMode = import.meta.env.MODE === 'test'

export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey !== 'AIzaSyExampleKey1234567890' &&
  apiKey !== 'mock-api-key' &&
  projectId &&
  projectId !== 'dodamdodam-app'
)

if (!isTestMode && !isFirebaseConfigured) {
  console.warn(
    '[도담도담 안내] ⚠️ Firebase 실제 설정 키가 누락되었거나 기본 예시 값입니다. 배포 시 .env.local 또는 호스팅 환경변수(VITE_FIREBASE_*)를 설정해주세요.'
  )
}

const firebaseConfig = {
  apiKey: apiKey || 'unconfigured-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dodamdodam-app.firebaseapp.com',
  projectId: projectId || 'unconfigured-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dodamdodam-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:000000000000',
}

// Initialize Firebase (Singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
