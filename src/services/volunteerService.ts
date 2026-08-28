import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS, getCollectionPath } from '@/utils/firestorePaths'
import type { Volunteer } from '@/types'

// 기본 운영 자원봉사자 15인 실명 명단 (기본 승인 상태)
const BASE_REAL_VOLUNTEERS: Volunteer[] = [
  { id: 'vol-boyun', name: '장보윤', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-yeeun', name: '신예은', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-dura', name: '정두라', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-chohee', name: '황초희', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-jiwon', name: '오지원', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-minji', name: '천민지', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-minki', name: '손민기', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-minseo', name: '방민서', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-hyunyoung', name: '최현영', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-gyumin', name: '김규민', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-myungjin', name: '강명진', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-minjun', name: '김민준', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-seoyeon', name: '이서연', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-dohyun', name: '박도현', status: 'approved', createdAt: Timestamp.now() },
  { id: 'vol-sungmin', name: '배성민', status: 'approved', createdAt: Timestamp.now() },
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
      parsed.forEach((v) => {
        // 기존 저장된 봉사자 중 status 누락 시 'approved'로 기본값 설정
        map.set(v.id, {
          ...v,
          status: v.status || 'approved',
        })
      })
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
const pendingVolunteerSubscribers = new Set<VolunteerCallback>()

function notifySubscribers() {
  const approvedList = localVolunteers.filter((v) => (v.status || 'approved') === 'approved')
  allVolunteerSubscribers.forEach((cb) => cb([...approvedList]))

  const pendingList = localVolunteers.filter((v) => v.status === 'pending')
  pendingVolunteerSubscribers.forEach((cb) => cb([...pendingList]))
}

/**
 * [승인된 자원봉사자 실시간 구독] - 일반 일정 신청 및 드롭다운용
 */
export function subscribeVolunteers(
  callback: (volunteers: Volunteer[]) => void,
  errorCallback?: (error: Error) => void
) {
  allVolunteerSubscribers.add(callback)

  const approvedList = localVolunteers.filter((v) => (v.status || 'approved') === 'approved')
  callback([...approvedList])

  let hasReceivedSnapshot = false
  const timer = setTimeout(() => {
    if (!hasReceivedSnapshot) {
      const curApproved = localVolunteers.filter((v) => (v.status || 'approved') === 'approved')
      callback([...curApproved])
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
            if (existing) {
              existing.status = data.status || existing.status || 'approved'
              if (data.password) existing.password = data.password
            } else {
              localVolunteers.push({
                id,
                name: data.name || '',
                password: data.password || '',
                status: data.status || 'approved',
                createdAt: data.createdAt,
                approvedAt: data.approvedAt,
                rejectedAt: data.rejectedAt,
              })
            }
          })
          saveVolunteers()
        }
        notifySubscribers()
      },
      (err) => {
        clearTimeout(timer)
        const curApproved = localVolunteers.filter((v) => (v.status || 'approved') === 'approved')
        callback([...curApproved])
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
 * [승인 대기 중인 봉사자 실시간 구독] - 관리자 승인용
 */
export function subscribePendingVolunteers(callback: (volunteers: Volunteer[]) => void) {
  pendingVolunteerSubscribers.add(callback)
  const pendingList = localVolunteers.filter((v) => v.status === 'pending')
  callback([...pendingList])

  return () => {
    pendingVolunteerSubscribers.delete(callback)
  }
}

/**
 * [전체 봉사자 목록 실시간 구독] - 관리자 전체 관리용
 */
export function subscribeAllVolunteers(callback: (volunteers: Volunteer[]) => void) {
  const handler = () => callback([...localVolunteers])
  allVolunteerSubscribers.add(handler)
  callback([...localVolunteers])

  return () => {
    allVolunteerSubscribers.delete(handler)
  }
}

/**
 * [신규 봉사자 가입 신청] - 승인 대기(pending) 상태로 생성
 */
export async function registerVolunteer(name: string, password: string): Promise<Volunteer> {
  const trimmedName = name.trim()
  const trimmedPassword = password.trim()

  if (!trimmedName) throw new Error('이름을 입력해주세요.')
  if (!trimmedPassword || trimmedPassword.length < 4) {
    throw new Error('비밀번호는 4자리 이상 입력해주세요.')
  }

  const existing = localVolunteers.find((v) => v.name === trimmedName)
  if (existing) {
    if (existing.status === 'approved') {
      throw new Error(`'${trimmedName}'님은 이미 승인된 봉사자입니다. [로그인] 탭에서 입장해주세요.`)
    }
    if (existing.status === 'pending') {
      throw new Error(`'${trimmedName}'님은 이미 관리자 승인 대기 중입니다. 승인 완료 후 로그인하실 수 있습니다.`)
    }
    // 반려 상태인 경우 재신청 처리
    existing.status = 'pending'
    existing.password = trimmedPassword
    saveVolunteers()
    notifySubscribers()

    try {
      updateDoc(doc(db, getCollectionPath.volunteer(existing.id)), {
        status: 'pending',
        password: trimmedPassword,
        updatedAt: serverTimestamp(),
      }).catch(() => {})
    } catch {}

    return existing
  }

  const newVol: Volunteer = {
    id: `vol-${Date.now()}`,
    name: trimmedName,
    password: trimmedPassword,
    status: 'pending',
    createdAt: Timestamp.now(),
  }

  localVolunteers.push(newVol)
  saveVolunteers()
  notifySubscribers()

  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.VOLUNTEERS), {
      name: trimmedName,
      password: trimmedPassword,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    newVol.id = docRef.id
    saveVolunteers()
    notifySubscribers()
  } catch {}

  return newVol
}

/**
 * [봉사자 로그인] - 이름 및 비밀번호 검증 & 승인 상태 확인
 */
export async function loginVolunteer(name: string, password: string): Promise<Volunteer> {
  const trimmedName = name.trim()
  const trimmedPassword = password.trim()

  if (!trimmedName) throw new Error('이름을 입력해주세요.')
  if (!trimmedPassword) throw new Error('비밀번호를 입력해주세요.')

  const target = localVolunteers.find((v) => v.name === trimmedName)
  if (!target) {
    throw new Error(`등록되지 않은 봉사자입니다. 먼저 [봉사자 등록 신청]을 진행해주세요.`)
  }

  if (target.status === 'pending') {
    throw new Error(`'${trimmedName}'님은 현재 관리자 승인 대기 중입니다. 관리자 승인 완료 후 로그인하실 수 있습니다.`)
  }

  if (target.status === 'rejected') {
    throw new Error(`'${trimmedName}'님의 봉사자 등록이 반려되었습니다. 관리자에게 문의해주세요.`)
  }

  // 비밀번호가 설정되어 있는 경우 검증
  if (target.password && target.password !== trimmedPassword) {
    throw new Error('비밀번호가 일치하지 않습니다. 다시 확인해주세요.')
  }

  // 기본 15인 등 비밀번호가 아직 미설정된 경우 이번 비밀번호로 등록
  if (!target.password) {
    target.password = trimmedPassword
    saveVolunteers()
    try {
      updateDoc(doc(db, getCollectionPath.volunteer(target.id)), {
        password: trimmedPassword,
      }).catch(() => {})
    } catch {}
  }

  return target
}

/**
 * [관리자: 봉사자 승인]
 */
export async function approveVolunteer(id: string): Promise<void> {
  const target = localVolunteers.find((v) => v.id === id)
  if (!target) return

  target.status = 'approved'
  target.approvedAt = Timestamp.now()
  saveVolunteers()
  notifySubscribers()

  try {
    updateDoc(doc(db, getCollectionPath.volunteer(id)), {
      status: 'approved',
      approvedAt: serverTimestamp(),
    }).catch(() => {})
  } catch {}
}

/**
 * [관리자: 봉사자 반려/거절]
 */
export async function rejectVolunteer(id: string): Promise<void> {
  const target = localVolunteers.find((v) => v.id === id)
  if (!target) return

  target.status = 'rejected'
  target.rejectedAt = Timestamp.now()
  saveVolunteers()
  notifySubscribers()

  try {
    updateDoc(doc(db, getCollectionPath.volunteer(id)), {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
    }).catch(() => {})
  } catch {}
}

/**
 * [관리자: 직접 봉사자 등록] - 즉시 승인 상태로 추가
 */
export async function addVolunteer(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('이름을 입력해주세요.')

  const existing = localVolunteers.find((v) => v.name === trimmed)
  if (existing) {
    if (existing.status === 'pending') {
      await approveVolunteer(existing.id)
      return { id: existing.id }
    }
    throw new Error(`이미 '${trimmed}' 봉사자가 등록되어 있습니다.`)
  }

  const newVol: Volunteer = {
    id: `vol-${Date.now()}`,
    name: trimmed,
    status: 'approved',
    createdAt: Timestamp.now(),
    approvedAt: Timestamp.now(),
  }

  localVolunteers.push(newVol)
  saveVolunteers()
  notifySubscribers()

  try {
    addDoc(collection(db, COLLECTIONS.VOLUNTEERS), {
      name: trimmed,
      status: 'approved',
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
    }).then((docRef) => {
      newVol.id = docRef.id
      saveVolunteers()
      notifySubscribers()
    }).catch(() => {})
  } catch {}

  return { id: newVol.id }
}

/**
 * [봉사자 삭제]
 */
export async function removeVolunteer(id: string) {
  const idx = localVolunteers.findIndex((v) => v.id === id)
  if (idx !== -1) {
    localVolunteers.splice(idx, 1)
    saveVolunteers()
    notifySubscribers()
  }

  try {
    deleteDoc(doc(db, getCollectionPath.volunteer(id))).catch(() => {})
  } catch {}
}
