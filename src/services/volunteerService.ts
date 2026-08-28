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
import type { Volunteer } from '@/types'

// 기본 운영 자원봉사자 15인 실명 명단
const BASE_REAL_VOLUNTEERS: Volunteer[] = [
  { id: 'vol-boyun', name: '장보윤', createdAt: Timestamp.now() },
  { id: 'vol-yeeun', name: '신예은', createdAt: Timestamp.now() },
  { id: 'vol-dura', name: '정두라', createdAt: Timestamp.now() },
  { id: 'vol-chohee', name: '황초희', createdAt: Timestamp.now() },
  { id: 'vol-jiwon', name: '오지원', createdAt: Timestamp.now() },
  { id: 'vol-minji', name: '천민지', createdAt: Timestamp.now() },
  { id: 'vol-minki', name: '손민기', createdAt: Timestamp.now() },
  { id: 'vol-minseo', name: '방민서', createdAt: Timestamp.now() },
  { id: 'vol-hyunyoung', name: '최현영', createdAt: Timestamp.now() },
  { id: 'vol-gyumin', name: '김규민', createdAt: Timestamp.now() },
  { id: 'vol-myungjin', name: '강명진', createdAt: Timestamp.now() },
  { id: 'vol-minjun', name: '김민준', createdAt: Timestamp.now() },
  { id: 'vol-seoyeon', name: '이서연', createdAt: Timestamp.now() },
  { id: 'vol-dohyun', name: '박도현', createdAt: Timestamp.now() },
  { id: 'vol-sungmin', name: '배성민', createdAt: Timestamp.now() },
]

function getStoredVolunteers(): Volunteer[] {
  const map = new Map<string, Volunteer>()
  
  // 1. 기본 15명 등록
  BASE_REAL_VOLUNTEERS.forEach((v) => map.set(v.id, { ...v }))

  // 2. 로컬 스토리지 커스텀 추가 봉사자 머지
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('dodam_custom_volunteers') : null
    if (raw) {
      const parsed = JSON.parse(raw) as Volunteer[]
      parsed.forEach((v) => map.set(v.id, v))
    }

    // 3. 삭제된 봉사자 ID 제외
    const deletedRaw = typeof window !== 'undefined' ? localStorage.getItem('dodam_deleted_volunteers') : null
    if (deletedRaw) {
      const deletedIds = JSON.parse(deletedRaw) as string[]
      deletedIds.forEach((id) => map.delete(id))
    }
  } catch {}

  return Array.from(map.values())
}

const localVolunteers: Volunteer[] = getStoredVolunteers()

function saveVolunteers() {
  try {
    if (typeof window !== 'undefined') {
      const customOnes = localVolunteers.filter((v) => !BASE_REAL_VOLUNTEERS.some((r) => r.id === v.id))
      localStorage.setItem('dodam_custom_volunteers', JSON.stringify(customOnes))

      const remainingBaseIds = new Set(localVolunteers.map((v) => v.id))
      const deletedBaseIds = BASE_REAL_VOLUNTEERS.filter((r) => !remainingBaseIds.has(r.id)).map((r) => r.id)
      localStorage.setItem('dodam_deleted_volunteers', JSON.stringify(deletedBaseIds))
    }
  } catch {}
}

type VolunteerCallback = (volunteers: Volunteer[]) => void
const allVolunteerSubscribers = new Set<VolunteerCallback>()

function notifyAllVolunteerSubscribers() {
  allVolunteerSubscribers.forEach((cb) => cb([...localVolunteers]))
}

/**
 * 자원봉사자 목록 실시간 구독 (기본 15인 상시 보장 + 추가/삭제 즉시 반영)
 */
export function subscribeVolunteers(
  callback: (volunteers: Volunteer[]) => void,
  errorCallback?: (error: Error) => void
) {
  allVolunteerSubscribers.add(callback)

  // 1. 즉시 현재 전체 목록 전달 (15명 + 추가된 봉사자)
  callback([...localVolunteers])

  let hasReceivedSnapshot = false
  const timer = setTimeout(() => {
    if (!hasReceivedSnapshot) {
      callback([...localVolunteers])
    }
  }, 1200)

  try {
    const q = query(collection(db, COLLECTIONS.VOLUNTEERS), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        hasReceivedSnapshot = true
        clearTimeout(timer)
        if (!snapshot.empty) {
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data()
            const id = docSnap.id
            const existing = localVolunteers.find((v) => v.id === id || v.name === data.name)
            if (!existing) {
              localVolunteers.push({
                id,
                name: data.name || '',
                createdAt: data.createdAt,
              })
            }
          })
          saveVolunteers()
        }
        callback([...localVolunteers])
      },
      (err) => {
        clearTimeout(timer)
        callback([...localVolunteers])
        if (errorCallback) errorCallback(err)
      }
    )
    return () => {
      clearTimeout(timer)
      allVolunteerSubscribers.delete(callback)
      unsubscribe()
    }
  } catch (err) {
    clearTimeout(timer)
    return () => {
      allVolunteerSubscribers.delete(callback)
    }
  }
}

/**
 * 자원봉사자 1회 목록 조회
 */
export async function getVolunteersOnce(): Promise<Volunteer[]> {
  try {
    const q = query(collection(db, COLLECTIONS.VOLUNTEERS), orderBy('createdAt', 'asc'))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return [...localVolunteers]
    
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data()
      const id = docSnap.id
      const existing = localVolunteers.find((v) => v.id === id || v.name === data.name)
      if (!existing) {
        localVolunteers.push({
          id,
          name: data.name || '',
          createdAt: data.createdAt,
        })
      }
    })
    return [...localVolunteers]
  } catch {
    return [...localVolunteers]
  }
}

/**
 * [초고속 즉시 등록] 자원봉사자 추가 (기존 15인 보존 + 0초 반영)
 */
export async function addVolunteer(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('이름을 입력해주세요.')

  const existing = localVolunteers.find((v) => v.name === trimmed)
  if (existing) throw new Error(`이미 '${trimmed}' 봉사자가 등록되어 있습니다.`)

  const newVol: Volunteer = {
    id: `vol-${Date.now()}`,
    name: trimmed,
    createdAt: Timestamp.now(),
  }

  // 1. 기존 명단에 즉시 추가 & 0초 브로드캐스트
  localVolunteers.push(newVol)
  saveVolunteers()
  notifyAllVolunteerSubscribers()

  // 2. 백그라운드 Firestore 비동기 저장
  try {
    addDoc(collection(db, COLLECTIONS.VOLUNTEERS), {
      name: trimmed,
      createdAt: serverTimestamp(),
    }).then((docRef) => {
      newVol.id = docRef.id
      saveVolunteers()
      notifyAllVolunteerSubscribers()
    }).catch(() => {})
  } catch {}

  return { id: newVol.id }
}

/**
 * [초고속 즉시 삭제] 자원봉사자 삭제 (0초 반영)
 */
export async function removeVolunteer(id: string) {
  const idx = localVolunteers.findIndex((v) => v.id === id)
  if (idx !== -1) {
    localVolunteers.splice(idx, 1)
    saveVolunteers()
    notifyAllVolunteerSubscribers()
  }

  try {
    deleteDoc(doc(db, getCollectionPath.volunteer(id))).catch(() => {})
  } catch {}
}
