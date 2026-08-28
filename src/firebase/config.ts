import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const isTestMode = import.meta.env.MODE === 'test'

if (!isTestMode && (!apiKey || apiKey === 'AIzaSyExampleKey1234567890' || apiKey === 'mock-api-key')) {
  console.warn(
    '[도담도담] ⚠️ Firebase API Key가 실제 값으로 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
  )
}

const firebaseConfig = {
  apiKey: apiKey || 'mock-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dodamdodam-app.firebaseapp.com',
  projectId: projectId || 'dodamdodam-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dodamdodam-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
}

// Initialize Firebase (Singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
