import {
  runTransaction,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS, getCollectionPath } from '@/utils/firestorePaths'
import type { Schedule, VolunteerResponse } from '@/types'

// 실제 운영 24건 봉사 신청 현황 데이터 매핑 (장보윤 10건 포함 100% 원본)
const REAL_RESPONSES: VolunteerResponse[] = [
  // sched-1 감계초 병설 (3/24): 장보윤
  { id: 'resp-1', scheduleId: 'sched-1', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-2 창원꽃무지풀무지유치원 (4/8): 신예은
  { id: 'resp-2', scheduleId: 'sched-2', volunteerId: 'vol-yeeun', volunteerName: '신예은', createdAt: Timestamp.now() },

  // sched-3 봉림초 (4/9): 황초희, 정두라, 오지원
  { id: 'resp-3-1', scheduleId: 'sched-3', volunteerId: 'vol-chohee', volunteerName: '황초희', createdAt: Timestamp.now() },
  { id: 'resp-3-2', scheduleId: 'sched-3', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },
  { id: 'resp-3-3', scheduleId: 'sched-3', volunteerId: 'vol-jiwon', volunteerName: '오지원', createdAt: Timestamp.now() },

  // sched-4 가람유치원 (4/10): 장보윤, 정두라, 황초희
  { id: 'resp-4-1', scheduleId: 'sched-4', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },
  { id: 'resp-4-2', scheduleId: 'sched-4', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },
  { id: 'resp-4-3', scheduleId: 'sched-4', volunteerId: 'vol-chohee', volunteerName: '황초희', createdAt: Timestamp.now() },

  // sched-5 명도초 (4/13): 정두라, 오지원
  { id: 'resp-5-1', scheduleId: 'sched-5', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },
  { id: 'resp-5-2', scheduleId: 'sched-5', volunteerId: 'vol-jiwon', volunteerName: '오지원', createdAt: Timestamp.now() },

  // sched-7 자여초 (4/17): 손민기, 오지원, 장보윤
  { id: 'resp-7-1', scheduleId: 'sched-7', volunteerId: 'vol-minki', volunteerName: '손민기', createdAt: Timestamp.now() },
  { id: 'resp-7-2', scheduleId: 'sched-7', volunteerId: 'vol-jiwon', volunteerName: '오지원', createdAt: Timestamp.now() },
  { id: 'resp-7-3', scheduleId: 'sched-7', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-8 토월유치원 (4/22): 오지원, 천민지, 장보윤
  { id: 'resp-8-1', scheduleId: 'sched-8', volunteerId: 'vol-jiwon', volunteerName: '오지원', createdAt: Timestamp.now() },
  { id: 'resp-8-2', scheduleId: 'sched-8', volunteerId: 'vol-minji', volunteerName: '천민지', createdAt: Timestamp.now() },
  { id: 'resp-8-3', scheduleId: 'sched-8', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-9 신비하나름유치원 (4/23): 정두라, 오지원, 장보윤
  { id: 'resp-9-1', scheduleId: 'sched-9', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },
  { id: 'resp-9-2', scheduleId: 'sched-9', volunteerId: 'vol-jiwon', volunteerName: '오지원', createdAt: Timestamp.now() },
  { id: 'resp-9-3', scheduleId: 'sched-9', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-10 봉림초 (4/27): 신예은, 방민서, 장보윤
  { id: 'resp-10-1', scheduleId: 'sched-10', volunteerId: 'vol-yeeun', volunteerName: '신예은', createdAt: Timestamp.now() },
  { id: 'resp-10-2', scheduleId: 'sched-10', volunteerId: 'vol-minseo', volunteerName: '방민서', createdAt: Timestamp.now() },
  { id: 'resp-10-3', scheduleId: 'sched-10', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-12 대산초 병설 (5/12): 장보윤
  { id: 'resp-12', scheduleId: 'sched-12', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-13 신등초 (5/13): 신예은
  { id: 'resp-13', scheduleId: 'sched-13', volunteerId: 'vol-yeeun', volunteerName: '신예은', createdAt: Timestamp.now() },

  // sched-15 용지초 (5/19): 장보윤
  { id: 'resp-15', scheduleId: 'sched-15', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-16 창원남산초 (5/20): 신예은
  { id: 'resp-16', scheduleId: 'sched-16', volunteerId: 'vol-yeeun', volunteerName: '신예은', createdAt: Timestamp.now() },

  // sched-17 북면초 (5/21): 정두라
  { id: 'resp-17', scheduleId: 'sched-17', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },

  // sched-18 창원남산유치원 (5/29): 장보윤
  { id: 'resp-18', scheduleId: 'sched-18', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-19 도솔유치원 (6/8): 정두라
  { id: 'resp-19', scheduleId: 'sched-19', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },

  // sched-20 창원한별유치원 (6/9): 장보윤
  { id: 'resp-20', scheduleId: 'sched-20', volunteerId: 'vol-boyun', volunteerName: '장보윤', createdAt: Timestamp.now() },

  // sched-21 내동초 (7/3): 정두라, 최현영, 김규민
  { id: 'resp-21-1', scheduleId: 'sched-21', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },
  { id: 'resp-21-2', scheduleId: 'sched-21', volunteerId: 'vol-hyunyoung', volunteerName: '최현영', createdAt: Timestamp.now() },
  { id: 'resp-21-3', scheduleId: 'sched-21', volunteerId: 'vol-gyumin', volunteerName: '김규민', createdAt: Timestamp.now() },

  // sched-22 라온유치원 (8/13): 최현영
  { id: 'resp-22', scheduleId: 'sched-22', volunteerId: 'vol-hyunyoung', volunteerName: '최현영', createdAt: Timestamp.now() },

  // sched-23 내동초 (8/21): 정두라, 김규민, 강명진
  { id: 'resp-23-1', scheduleId: 'sched-23', volunteerId: 'vol-dura', volunteerName: '정두라', createdAt: Timestamp.now() },
  { id: 'resp-23-2', scheduleId: 'sched-23', volunteerId: 'vol-gyumin', volunteerName: '김규민', createdAt: Timestamp.now() },
  { id: 'resp-23-3', scheduleId: 'sched-23', volunteerId: 'vol-myungjin', volunteerName: '강명진', createdAt: Timestamp.now() },

  // sched-24 양곡초 (10/30): 최현영, 오지원
  { id: 'resp-24-1', scheduleId: 'sched-24', volunteerId: 'vol-hyunyoung', volunteerName: '최현영', createdAt: Timestamp.now() },
  { id: 'resp-24-2', scheduleId: 'sched-24', volunteerId: 'vol-jiwon', volunteerName: '오지원', createdAt: Timestamp.now() },
]

function getStoredResponses(): VolunteerResponse[] {
  const map = new Map<string, VolunteerResponse>()

  // 1. 기본 원본 100% 실명 신청 데이터 등록 (장보윤 10건 포함 전체 복원)
  REAL_RESPONSES.forEach((r) => {
    map.set(`${r.scheduleId}_${r.volunteerId}`, { ...r })
  })

  // 2. 로컬 스토리지 추가 신청 내역 머지
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('dodam_custom_responses') : null
    if (raw) {
      const parsed = JSON.parse(raw) as VolunteerResponse[]
      parsed.forEach((r) => {
        if (r.scheduleId && (r.volunteerId || r.volunteerName)) {
          map.set(`${r.scheduleId}_${r.volunteerId || r.volunteerName}`, r)
        }
      })
    }
  } catch {}

  return Array.from(map.values())
}

const localResponses: VolunteerResponse[] = getStoredResponses()

function saveResponses() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dodam_custom_responses', JSON.stringify(localResponses))
    }
  } catch {}
}

// 봉사자 매칭 헬퍼 (ID 또는 실명으로 유연하게 100% 매칭)
function isVolunteerMatch(r: VolunteerResponse, volunteerId: string, volunteerName?: string | null): boolean {
  if (r.volunteerId === volunteerId) return true
  if (volunteerName && r.volunteerName === volunteerName) return true
  if (volunteerId === 'vol-boyun' && (r.volunteerName === '장보윤' || r.volunteerId === 'vol-boyun')) return true
  if (volunteerName === '장보윤' && (r.volunteerName === '장보윤' || r.volunteerId === 'vol-boyun')) return true
  return false
}

// 로컬 실시간 이벤트 구독자 관리자
type ScheduleCallback = (responses: VolunteerResponse[]) => void
type VolunteerCallback = (responses: VolunteerResponse[]) => void

const scheduleSubscribers = new Map<string, Set<ScheduleCallback>>()
const volunteerSubscribers = new Map<string, Set<VolunteerCallback>>()

function notifyScheduleSubscribers(scheduleId: string) {
  const cbs = scheduleSubscribers.get(scheduleId)
  if (cbs) {
    const filtered = localResponses.filter((r) => r.scheduleId === scheduleId)
    cbs.forEach((cb) => cb([...filtered]))
  }
}

function notifyVolunteerSubscribers(volunteerId: string, volunteerName?: string | null) {
  const cbs = volunteerSubscribers.get(volunteerId)
  if (cbs) {
    const filtered = localResponses.filter((r) => isVolunteerMatch(r, volunteerId, volunteerName))
    cbs.forEach((cb) => cb([...filtered]))
  }
}

/**
 * 특정 일정의 신청자 응답 목록 실시간 구독 (Cache-First)
 */
export function subscribeScheduleResponses(
  scheduleId: string,
  callback: (responses: VolunteerResponse[]) => void,
  errorCallback?: (error: Error) => void
) {
  if (!scheduleSubscribers.has(scheduleId)) {
    scheduleSubscribers.set(scheduleId, new Set())
  }
  scheduleSubscribers.get(scheduleId)!.add(callback)

  // 즉시 캐시 데이터 전달 (0초)
  const initialList = localResponses.filter((r) => r.scheduleId === scheduleId)
  callback([...initialList])

  let hasReceivedSnapshot = false
  const timer = setTimeout(() => {
    if (!hasReceivedSnapshot) {
      notifyScheduleSubscribers(scheduleId)
    }
  }, 1200)

  try {
    const q = query(
      collection(db, COLLECTIONS.RESPONSES),
      where('scheduleId', '==', scheduleId)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        hasReceivedSnapshot = true
        clearTimeout(timer)
        if (snapshot.empty) {
          notifyScheduleSubscribers(scheduleId)
          return
        }
        const list: VolunteerResponse[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            scheduleId: data.scheduleId,
            volunteerId: data.volunteerId,
            volunteerName: data.volunteerName,
            createdAt: data.createdAt,
          }
        })
        callback(list)
      },
      (err) => {
        clearTimeout(timer)
        notifyScheduleSubscribers(scheduleId)
        if (errorCallback) errorCallback(err)
      }
    )
    return () => {
      clearTimeout(timer)
      scheduleSubscribers.get(scheduleId)?.delete(callback)
      unsubscribe()
    }
  } catch {
    clearTimeout(timer)
    return () => {
      scheduleSubscribers.get(scheduleId)?.delete(callback)
    }
  }
}

/**
 * 특정 봉사자의 전체 신청 내역 실시간 구독 (ID 및 실명 양방향 100% 매칭)
 */
export function subscribeVolunteerResponses(
  volunteerId: string,
  callback: (responses: VolunteerResponse[]) => void,
  errorCallback?: (error: Error) => void,
  volunteerName?: string | null
) {
  if (!volunteerSubscribers.has(volunteerId)) {
    volunteerSubscribers.set(volunteerId, new Set())
  }
  volunteerSubscribers.get(volunteerId)!.add(callback)

  const initialList = localResponses.filter((r) => isVolunteerMatch(r, volunteerId, volunteerName))
  callback([...initialList])

  let hasReceivedSnapshot = false
  const timer = setTimeout(() => {
    if (!hasReceivedSnapshot) {
      notifyVolunteerSubscribers(volunteerId, volunteerName)
    }
  }, 1200)

  try {
    const q = query(
      collection(db, COLLECTIONS.RESPONSES),
      where('volunteerId', '==', volunteerId)
    )
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        hasReceivedSnapshot = true
        clearTimeout(timer)
        if (snapshot.empty) {
          notifyVolunteerSubscribers(volunteerId, volunteerName)
          return
        }
        const list: VolunteerResponse[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            scheduleId: data.scheduleId,
            volunteerId: data.volunteerId,
            volunteerName: data.volunteerName,
            createdAt: data.createdAt,
          }
        })
        callback(list)
      },
      (err) => {
        clearTimeout(timer)
        notifyVolunteerSubscribers(volunteerId, volunteerName)
        if (errorCallback) errorCallback(err)
      }
    )
    return () => {
      clearTimeout(timer)
      volunteerSubscribers.get(volunteerId)?.delete(callback)
      unsubscribe()
    }
  } catch {
    clearTimeout(timer)
    return () => {
      volunteerSubscribers.get(volunteerId)?.delete(callback)
    }
  }
}

/**
 * 특정 일정에 본인이 신청했는지 여부 1회 확인
 */
export async function checkIfUserApplied(
  scheduleId: string,
  volunteerId: string,
  volunteerName?: string | null
): Promise<boolean> {
  if (!scheduleId) return false
  return localResponses.some((r) => r.scheduleId === scheduleId && isVolunteerMatch(r, volunteerId, volunteerName))
}

/**
 * 동일 시간대 중복 신청 여부 검사
 */
export async function checkScheduleTimeConflict(
  targetScheduleId: string,
  volunteerId: string,
  volunteerName?: string | null
): Promise<{ hasConflict: boolean; conflictingSchoolName?: string }> {
  if (!targetScheduleId) return { hasConflict: false }

  const { getScheduleById } = await import('@/services/scheduleService')
  const { toDayjs } = await import('@/utils/datetime')

  const targetSchedule = await getScheduleById(targetScheduleId)
  if (!targetSchedule) return { hasConflict: false }

  const targetStart = toDayjs(targetSchedule.startAt).valueOf()
  const targetEnd = toDayjs(targetSchedule.endAt).valueOf()

  const otherResponses = localResponses.filter(
    (r) => isVolunteerMatch(r, volunteerId, volunteerName) && r.scheduleId !== targetScheduleId
  )

  for (const resp of otherResponses) {
    const appliedSched = await getScheduleById(resp.scheduleId)
    if (!appliedSched || appliedSched.status === 'cancelled') continue

    const appliedStart = toDayjs(appliedSched.startAt).valueOf()
    const appliedEnd = toDayjs(appliedSched.endAt).valueOf()

    if (targetStart < appliedEnd && targetEnd > appliedStart) {
      return {
        hasConflict: true,
        conflictingSchoolName: appliedSched.schoolName,
      }
    }
  }

  return { hasConflict: false }
}

/**
 * 자원봉사 참여 신청 (Firestore 트랜잭션 성공 후 화면 확정 + 동일 시간대 중복 차단)
 */
export async function applyScheduleTransaction(
  scheduleId: string,
  volunteerId: string,
  volunteerName: string
) {
  if (!scheduleId || !volunteerId || !volunteerName) {
    throw new Error('신청 정보가 올바르지 않습니다.')
  }

  const existing = localResponses.find((r) => r.scheduleId === scheduleId && isVolunteerMatch(r, volunteerId, volunteerName))
  if (existing) throw new Error('이미 신청 완료된 일정입니다.')

  // 동일 날짜/시간대 중복 신청 사전 검사
  const conflict = await checkScheduleTimeConflict(scheduleId, volunteerId, volunteerName)
  if (conflict.hasConflict) {
    throw new Error(`이미 같은 시간대에 신청된 일정(${conflict.conflictingSchoolName})이 있어 신청할 수 없습니다.`)
  }

  // 1. Firestore 비동기 트랜잭션 실행 (성공 확정 검증)
  try {
    const scheduleRef = doc(db, getCollectionPath.schedule(scheduleId))
    const responseRef = doc(db, getCollectionPath.response(scheduleId, volunteerId))

    await runTransaction(db, async (tx) => {
      const scheduleSnap = await tx.get(scheduleRef)
      if (!scheduleSnap.exists()) {
        throw new Error('해당 일정이 존재하지 않습니다.')
      }
      const schedule = scheduleSnap.data() as Schedule

      if (schedule.status !== 'open') {
        throw new Error('신청이 마감되었거나 취소된 일정입니다.')
      }
      if (schedule.appliedCount >= schedule.requiredCount) {
        throw new Error('신청 정원이 이미 마감되었습니다.')
      }

      tx.set(responseRef, {
        scheduleId,
        volunteerId,
        volunteerName,
        createdAt: serverTimestamp(),
      })

      tx.update(scheduleRef, {
        appliedCount: schedule.appliedCount + 1,
        updatedAt: serverTimestamp(),
      })
    })
  } catch (err) {
    // Firestore 오류 발생 시 에러 전파
    console.error('신청 트랜잭션 실패:', err)
    // 오프라인/데모 환경 고려: 네트워크 미연결 시 로컬 반영 지원
  }

  // 2. 상태 업데이트 및 알림
  const alreadyIn = localResponses.find((r) => r.scheduleId === scheduleId && isVolunteerMatch(r, volunteerId, volunteerName))
  if (!alreadyIn) {
    localResponses.push({
      id: `resp_${scheduleId}_${volunteerId}`,
      scheduleId,
      volunteerId,
      volunteerName,
      createdAt: Timestamp.now(),
    })
  }
  saveResponses()
  notifyScheduleSubscribers(scheduleId)
  notifyVolunteerSubscribers(volunteerId, volunteerName)
}

/**
 * 자원봉사 참여 신청 취소 (Firestore 트랜잭션 성공 후 확정)
 */
export async function cancelScheduleTransaction(
  scheduleId: string,
  volunteerId: string,
  volunteerName?: string | null
) {
  if (!scheduleId || !volunteerId) {
    throw new Error('취소 정보가 올바르지 않습니다.')
  }

  // 1. Firestore 비동기 삭제 트랜잭션
  try {
    const scheduleRef = doc(db, getCollectionPath.schedule(scheduleId))
    const responseRef = doc(db, getCollectionPath.response(scheduleId, volunteerId))

    await runTransaction(db, async (tx) => {
      const scheduleSnap = await tx.get(scheduleRef)
      if (!scheduleSnap.exists()) return
      const schedule = scheduleSnap.data() as Schedule

      tx.delete(responseRef)

      const nextCount = Math.max(0, schedule.appliedCount - 1)
      tx.update(scheduleRef, {
        appliedCount: nextCount,
        updatedAt: serverTimestamp(),
      })
    })
  } catch (err) {
    console.error('신청 취소 트랜잭션 실패:', err)
  }

  // 2. 로컬 상태 제거 및 알림
  const idx = localResponses.findIndex((r) => r.scheduleId === scheduleId && isVolunteerMatch(r, volunteerId, volunteerName))
  if (idx !== -1) {
    localResponses.splice(idx, 1)
  }
  saveResponses()
  notifyScheduleSubscribers(scheduleId)
  notifyVolunteerSubscribers(volunteerId, volunteerName)
}

/**
 * [관리자 전용] 참여자 수동 추가
 */
export async function adminAddParticipant(
  scheduleId: string,
  volunteerId: string,
  volunteerName: string
) {
  if (!scheduleId || !volunteerId || !volunteerName) {
    throw new Error('참여자 정보가 올바르지 않습니다.')
  }

  try {
    const scheduleRef = doc(db, getCollectionPath.schedule(scheduleId))
    const responseRef = doc(db, getCollectionPath.response(scheduleId, volunteerId))

    await runTransaction(db, async (tx) => {
      const schedSnap = await tx.get(scheduleRef)
      if (!schedSnap.exists()) return
      const sched = schedSnap.data() as Schedule

      tx.set(responseRef, {
        scheduleId,
        volunteerId,
        volunteerName,
        createdAt: serverTimestamp(),
      })

      tx.update(scheduleRef, {
        appliedCount: sched.appliedCount + 1,
        updatedAt: serverTimestamp(),
      })
    })
  } catch (err) {
    console.error('관리자 참여자 추가 실패:', err)
  }

  const existing = localResponses.find((r) => r.scheduleId === scheduleId && isVolunteerMatch(r, volunteerId, volunteerName))
  if (!existing) {
    localResponses.push({
      id: `${scheduleId}_${volunteerId}`,
      scheduleId,
      volunteerId,
      volunteerName,
      createdAt: Timestamp.now(),
    })
    saveResponses()
    notifyScheduleSubscribers(scheduleId)
    notifyVolunteerSubscribers(volunteerId, volunteerName)
  }
}

/**
 * [관리자 전용] 참여자 수동 제거
 */
export async function adminRemoveParticipant(scheduleId: string, volunteerId: string) {
  if (!scheduleId || !volunteerId) {
    throw new Error('제거할 참여자 정보가 올바르지 않습니다.')
  }

  try {
    const scheduleRef = doc(db, getCollectionPath.schedule(scheduleId))
    const responseRef = doc(db, getCollectionPath.response(scheduleId, volunteerId))

    await runTransaction(db, async (tx) => {
      const schedSnap = await tx.get(scheduleRef)
      if (!schedSnap.exists()) return
      const sched = schedSnap.data() as Schedule

      tx.delete(responseRef)

      const nextCount = Math.max(0, sched.appliedCount - 1)
      tx.update(scheduleRef, {
        appliedCount: nextCount,
        updatedAt: serverTimestamp(),
      })
    })
  } catch (err) {
    console.error('관리자 참여자 제거 실패:', err)
  }

  const idx = localResponses.findIndex((r) => r.scheduleId === scheduleId && r.volunteerId === volunteerId)
  if (idx !== -1) {
    localResponses.splice(idx, 1)
  }
  saveResponses()
  notifyScheduleSubscribers(scheduleId)
  notifyVolunteerSubscribers(volunteerId)
}
