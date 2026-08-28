import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS, getCollectionPath } from '@/utils/firestorePaths'
import type { Subject } from '@/types'

// 기본 운영 교육과목 4종
const BASE_REAL_SUBJECTS: Subject[] = [
  { id: 'sub-drug', name: '약물예방 교육', createdAt: Timestamp.now() },
  { id: 'sub-internet', name: '인터넷/스마트폰 과의존 예방', createdAt: Timestamp.now() },
  { id: 'sub-gamble', name: '도박예방 교육', createdAt: Timestamp.now() },
  { id: 'sub-caffeine', name: '카페인 예방 교육', createdAt: Timestamp.now() },
]

function getStoredSubjects(): Subject[] {
  const map = new Map<string, Subject>()

  // 1. 기본 4개 과목 등록
  BASE_REAL_SUBJECTS.forEach((s) => map.set(s.id, { ...s }))

  // 2. 커스텀 추가 과목 머지
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('dodam_custom_subjects') : null
    if (raw) {
      const parsed = JSON.parse(raw) as Subject[]
      parsed.forEach((s) => map.set(s.id, s))
    }

    // 3. 삭제된 과목 제외
    const deletedRaw = typeof window !== 'undefined' ? localStorage.getItem('dodam_deleted_subjects') : null
    if (deletedRaw) {
      const deletedIds = JSON.parse(deletedRaw) as string[]
      deletedIds.forEach((id) => map.delete(id))
    }
  } catch {}

  return Array.from(map.values())
}

const localSubjects: Subject[] = getStoredSubjects()

function saveSubjects() {
  try {
    if (typeof window !== 'undefined') {
      const customOnes = localSubjects.filter((s) => !BASE_REAL_SUBJECTS.some((r) => r.id === s.id))
      localStorage.setItem('dodam_custom_subjects', JSON.stringify(customOnes))

      const remainingBaseIds = new Set(localSubjects.map((s) => s.id))
      const deletedBaseIds = BASE_REAL_SUBJECTS.filter((r) => !remainingBaseIds.has(r.id)).map((r) => r.id)
      localStorage.setItem('dodam_deleted_subjects', JSON.stringify(deletedBaseIds))
    }
  } catch {}
}

type SubjectCallback = (subjects: Subject[]) => void
const allSubjectSubscribers = new Set<SubjectCallback>()

function notifyAllSubjectSubscribers() {
  allSubjectSubscribers.forEach((cb) => cb([...localSubjects]))
}

/**
 * 교육과목 목록 실시간 구독 (기본 4개 과목 상시 보장 + 추가/삭제 0초 즉시 반영)
 */
export function subscribeSubjects(
  callback: (subjects: Subject[]) => void,
  errorCallback?: (error: Error) => void
) {
  allSubjectSubscribers.add(callback)

  // 즉시 캐시 데이터 전달
  callback([...localSubjects])

  let hasReceivedSnapshot = false
  const timer = setTimeout(() => {
    if (!hasReceivedSnapshot) {
      callback([...localSubjects])
    }
  }, 1200)

  try {
    const q = query(collection(db, COLLECTIONS.SUBJECTS), orderBy('name', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        hasReceivedSnapshot = true
        clearTimeout(timer)
        if (!snapshot.empty) {
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data()
            const id = docSnap.id
            const existing = localSubjects.find((s) => s.id === id || s.name === data.name)
            if (!existing) {
              localSubjects.push({
                id,
                name: data.name || '',
                createdAt: data.createdAt,
              })
            }
          })
          saveSubjects()
        }
        callback([...localSubjects])
      },
      (err) => {
        clearTimeout(timer)
        callback([...localSubjects])
        if (errorCallback) errorCallback(err)
      }
    )
    return () => {
      clearTimeout(timer)
      allSubjectSubscribers.delete(callback)
      unsubscribe()
    }
  } catch {
    clearTimeout(timer)
    return () => {
      allSubjectSubscribers.delete(callback)
    }
  }
}

/**
 * 교육과목 1회 목록 조회
 */
export async function getSubjectsOnce(): Promise<Subject[]> {
  try {
    const q = query(collection(db, COLLECTIONS.SUBJECTS), orderBy('name', 'asc'))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return [...localSubjects]
    
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data()
      const id = docSnap.id
      const existing = localSubjects.find((s) => s.id === id || s.name === data.name)
      if (!existing) {
        localSubjects.push({
          id,
          name: data.name || '',
          createdAt: data.createdAt,
        })
      }
    })
    return [...localSubjects]
  } catch {
    return [...localSubjects]
  }
}

/**
 * [초고속 즉시 등록] 교육과목 추가 (기본 4과목 보존 + 0초 반영)
 */
export async function addSubject(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('과목명을 입력해주세요.')

  const existing = localSubjects.find((s) => s.name === trimmed)
  if (existing) throw new Error(`이미 '${trimmed}' 교육과목이 등록되어 있습니다.`)

  const newSub: Subject = {
    id: `sub-${Date.now()}`,
    name: trimmed,
    createdAt: Timestamp.now(),
  }

  // 1. 즉시 로컬 목록에 추가 및 0초 브로드캐스트
  localSubjects.push(newSub)
  saveSubjects()
  notifyAllSubjectSubscribers()

  // 2. 백그라운드 Firestore 비동기 저장
  try {
    addDoc(collection(db, COLLECTIONS.SUBJECTS), {
      name: trimmed,
      createdAt: serverTimestamp(),
    }).then((docRef) => {
      newSub.id = docRef.id
      saveSubjects()
      notifyAllSubjectSubscribers()
    }).catch(() => {})
  } catch {}

  return { id: newSub.id }
}

/**
 * [초고속 즉시 삭제] 교육과목 삭제 (0초 반영)
 */
export async function removeSubject(id: string) {
  const idx = localSubjects.findIndex((s) => s.id === id)
  if (idx !== -1) {
    localSubjects.splice(idx, 1)
    saveSubjects()
    notifyAllSubjectSubscribers()
  }

  try {
    deleteDoc(doc(db, getCollectionPath.subject(id))).catch(() => {})
  } catch {}
}
