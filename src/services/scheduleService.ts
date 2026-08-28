import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { COLLECTIONS, getCollectionPath } from '@/utils/firestorePaths'
import type { Schedule, ScheduleFormData } from '@/types'
import dayjs from 'dayjs'

function makeTs(dateStr: string, timeStr: string): Timestamp {
  return Timestamp.fromDate(dayjs(`${dateStr}T${timeStr}:00`).toDate())
}

// 2026년 기준 실제 유치원 및 초등학교 교육 일정 24건 (영구 기본 데이터)
const BASE_REAL_SCHEDULES: Schedule[] = [
  // 1. 유치원 교육 일정
  {
    id: 'sched-1',
    schoolName: '감계초등학교 병설유치원',
    subject: '약물예방 교육',
    startAt: makeTs('2026-03-24', '10:30'),
    endAt: makeTs('2026-03-24', '11:00'),
    address: '경남 창원시 의창구 북면 감계로 110번길 33',
    latitude: 35.3121,
    longitude: 128.5982,
    requiredCount: 3,
    appliedCount: 1,
    classInfo: '각반 교실 (1타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-2',
    schoolName: '창원꽃무지풀무지유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-04-08', '10:30'),
    endAt: makeTs('2026-04-08', '11:40'),
    address: '경남 창원시 의창구 남산로 27번길 16',
    latitude: 35.2573,
    longitude: 128.6214,
    requiredCount: 1,
    appliedCount: 1,
    classInfo: '강당 (2타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-3',
    schoolName: '봉림초등학교',
    subject: '도박예방 교육',
    startAt: makeTs('2026-04-09', '09:50'),
    endAt: makeTs('2026-04-09', '10:30'),
    address: '경남 창원시 의창구 봉림서로 31',
    latitude: 35.2536,
    longitude: 128.6751,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반 (1타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-4',
    schoolName: '가람유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-04-10', '10:00'),
    endAt: makeTs('2026-04-10', '11:50'),
    address: '경남 창원시 성산구 동산로 124번길 18',
    latitude: 35.2198,
    longitude: 128.6943,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반/3반/2반 (3타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-5',
    schoolName: '명도초등학교',
    subject: '도박예방 교육',
    startAt: makeTs('2026-04-13', '10:50'),
    endAt: makeTs('2026-04-13', '12:20'),
    address: '경남 창원시 의창구 명서로 81번길 15',
    latitude: 35.2482,
    longitude: 128.6431,
    requiredCount: 2,
    appliedCount: 2,
    classInfo: '반별 진행 - 2반/2반 (2타임)',
    note: '강사 2명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-6',
    schoolName: '화양초등학교',
    subject: '약물예방 교육',
    startAt: makeTs('2026-04-15', '13:00'),
    endAt: makeTs('2026-04-15', '13:40'),
    address: '경남 창원시 의창구 동읍 화양길 12',
    latitude: 35.2981,
    longitude: 128.6982,
    requiredCount: 1,
    appliedCount: 0,
    classInfo: '도서실 (1타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-7',
    schoolName: '자여초등학교',
    subject: '약물예방 교육',
    startAt: makeTs('2026-04-17', '13:10'),
    endAt: makeTs('2026-04-17', '13:50'),
    address: '경남 창원시 의창구 동읍 동읍로 15번길 8',
    latitude: 35.2894,
    longitude: 128.6875,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반 (1타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-8',
    schoolName: '토월유치원',
    subject: '약물예방 교육',
    startAt: makeTs('2026-04-22', '10:20'),
    endAt: makeTs('2026-04-22', '11:30'),
    address: '경남 창원시 성산구 신월로 42',
    latitude: 35.2281,
    longitude: 128.6892,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반/2반 (2타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-9',
    schoolName: '신비하나름유치원',
    subject: '약물예방 교육',
    startAt: makeTs('2026-04-23', '10:00'),
    endAt: makeTs('2026-04-23', '11:10'),
    address: '경남 창원시 마산회원구 구암서4길 19',
    latitude: 35.2341,
    longitude: 128.5912,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반/3반 (2타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-10',
    schoolName: '봉림초등학교',
    subject: '도박예방 교육',
    startAt: makeTs('2026-04-27', '09:50'),
    endAt: makeTs('2026-04-27', '11:20'),
    address: '경남 창원시 의창구 봉림서로 31',
    latitude: 35.2536,
    longitude: 128.6751,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반/2반 (2타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-11',
    schoolName: '용호유치원',
    subject: '약물예방 교육',
    startAt: makeTs('2026-04-29', '10:00'),
    endAt: makeTs('2026-04-29', '11:10'),
    address: '경남 창원시 성산구 용지로 239번길 18',
    latitude: 35.2312,
    longitude: 128.6811,
    requiredCount: 1,
    appliedCount: 0,
    classInfo: '강당 (2타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-12',
    schoolName: '대산초등학교 병설유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-05-12', '10:00'),
    endAt: makeTs('2026-05-12', '10:30'),
    address: '경남 창원시 의창구 대산면 진산대로 411',
    latitude: 35.3412,
    longitude: 128.7123,
    requiredCount: 1,
    appliedCount: 1,
    classInfo: '1반 (1타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-13',
    schoolName: '신등초등학교',
    subject: '약물예방 교육',
    startAt: makeTs('2026-05-13', '09:50'),
    endAt: makeTs('2026-05-13', '10:30'),
    address: '경남 산청군 신등면 신차로 542',
    latitude: 35.3892,
    longitude: 127.9941,
    requiredCount: 2,
    appliedCount: 1,
    classInfo: '반별 진행 - 2반 (1타임)',
    note: '강사 2명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-14',
    schoolName: '바른나무유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-05-18', '10:00'),
    endAt: makeTs('2026-05-18', '11:50'),
    address: '경남 창원시 마산회원구 양덕로 97',
    latitude: 35.2285,
    longitude: 128.5834,
    requiredCount: 1,
    appliedCount: 0,
    classInfo: '강당 (3타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-15',
    schoolName: '용지초등학교',
    subject: '약물예방 교육',
    startAt: makeTs('2026-05-19', '09:30'),
    endAt: makeTs('2026-05-19', '11:20'),
    address: '경남 창원시 성산구 동산로 185',
    latitude: 35.2251,
    longitude: 128.6914,
    requiredCount: 1,
    appliedCount: 1,
    classInfo: '반별 진행 - 1반/1반 (2타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-16',
    schoolName: '창원남산초등학교',
    subject: '약물예방 교육',
    startAt: makeTs('2026-05-20', '09:50'),
    endAt: makeTs('2026-05-20', '11:20'),
    address: '경남 창원시 의창구 남산로 27',
    latitude: 35.2568,
    longitude: 128.6205,
    requiredCount: 1,
    appliedCount: 1,
    classInfo: '반별 진행 - 1반/1반 (2타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-17',
    schoolName: '북면초등학교',
    subject: '약물예방 교육',
    startAt: makeTs('2026-05-21', '09:50'),
    endAt: makeTs('2026-05-21', '12:10'),
    address: '경남 창원시 의창구 북면 천주로 568',
    latitude: 35.3214,
    longitude: 128.5873,
    requiredCount: 3,
    appliedCount: 1,
    classInfo: '반별 진행 - 3반/3반/3반 (3타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-18',
    schoolName: '창원남산유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-05-29', '10:00'),
    endAt: makeTs('2026-05-29', '11:05'),
    address: '경남 창원시 의창구 남산로 27번길 12',
    latitude: 35.2571,
    longitude: 128.6210,
    requiredCount: 3,
    appliedCount: 1,
    classInfo: '반별 진행 - 3반/3반 (2타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-19',
    schoolName: '도솔유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-06-08', '10:30'),
    endAt: makeTs('2026-06-08', '12:10'),
    address: '경남 창원시 성산구 사파동 102-1',
    latitude: 35.2210,
    longitude: 128.7012,
    requiredCount: 1,
    appliedCount: 1,
    classInfo: '강당 (3타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-20',
    schoolName: '창원한별유치원',
    subject: '인터넷/스마트폰 과의존 예방',
    startAt: makeTs('2026-06-09', '10:00'),
    endAt: makeTs('2026-06-09', '11:40'),
    address: '경남 창원시 성산구 반림로 45',
    latitude: 35.2384,
    longitude: 128.6791,
    requiredCount: 3,
    appliedCount: 1,
    classInfo: '반별 진행 - 2반/2반/3반 (3타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-21',
    schoolName: '내동초등학교',
    subject: '도박예방 교육',
    startAt: makeTs('2026-07-03', '11:30'),
    endAt: makeTs('2026-07-03', '13:00'),
    address: '경남 창원시 성산구 충혼로 91',
    latitude: 35.2154,
    longitude: 128.6653,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 2반/3반 (2타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-22',
    schoolName: '라온유치원',
    subject: '카페인 예방 교육',
    startAt: makeTs('2026-08-13', '10:30'),
    endAt: makeTs('2026-08-13', '12:00'),
    address: '경남 창원시 마산회원구 합성동 293-1',
    latitude: 35.2412,
    longitude: 128.5831,
    requiredCount: 1,
    appliedCount: 1,
    classInfo: '강당에서 연령별 진행 (3타임)',
    note: '강사 1명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-23',
    schoolName: '내동초등학교',
    subject: '도박예방 교육',
    startAt: makeTs('2026-08-21', '11:30'),
    endAt: makeTs('2026-08-21', '13:00'),
    address: '경남 창원시 성산구 충혼로 91',
    latitude: 35.2154,
    longitude: 128.6653,
    requiredCount: 3,
    appliedCount: 3,
    classInfo: '반별 진행 - 3반/2반 (2타임)',
    note: '강사 3명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
  {
    id: 'sched-24',
    schoolName: '양곡초등학교',
    subject: '도박예방 교육',
    startAt: makeTs('2026-10-30', '09:50'),
    endAt: makeTs('2026-10-30', '11:20'),
    address: '경남 창원시 성산구 양곡로 66',
    latitude: 35.1983,
    longitude: 128.6672,
    requiredCount: 2,
    appliedCount: 2,
    classInfo: '반별 진행 - 2반/2반 (2타임)',
    note: '강사 2명 모집',
    status: 'open',
    createdAt: Timestamp.now(),
  },
]

function restoreScheduleTimestamp(s: any): Schedule {
  let startAt: Timestamp
  let endAt: Timestamp
  let createdAt: Timestamp = Timestamp.now()

  if (s.startAt && typeof s.startAt.toDate === 'function') {
    startAt = s.startAt
  } else if (s.startAt?.seconds) {
    startAt = new Timestamp(s.startAt.seconds, s.startAt.nanoseconds || 0)
  } else {
    startAt = Timestamp.fromDate(new Date(s.startAt))
  }

  if (s.endAt && typeof s.endAt.toDate === 'function') {
    endAt = s.endAt
  } else if (s.endAt?.seconds) {
    endAt = new Timestamp(s.endAt.seconds, s.endAt.nanoseconds || 0)
  } else {
    endAt = Timestamp.fromDate(new Date(s.endAt))
  }

  if (s.createdAt && typeof s.createdAt.toDate === 'function') {
    createdAt = s.createdAt
  } else if (s.createdAt?.seconds) {
    createdAt = new Timestamp(s.createdAt.seconds, s.createdAt.nanoseconds || 0)
  }

  return {
    ...s,
    startAt,
    endAt,
    createdAt,
  }
}

// 로컬 저장소 캐시 결합
function getStoredSchedules(): Schedule[] {
  const map = new Map<string, Schedule>()

  // 1. 기본 24건 등록
  BASE_REAL_SCHEDULES.forEach((s) => map.set(s.id, { ...s }))

  // 2. 커스텀 등록/수정 일정 머지
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('dodam_custom_schedules') : null
    if (raw) {
      const customList = JSON.parse(raw) as any[]
      customList.forEach((rawSched) => {
        const sched = restoreScheduleTimestamp(rawSched)
        map.set(sched.id, sched)
      })
    }
  } catch {}

  return Array.from(map.values())
}

const localSchedules = getStoredSchedules()

function saveSchedules() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dodam_custom_schedules', JSON.stringify(localSchedules))
    }
  } catch {}
}

// 전체 일정 구독자 관리자
type SchedulesCallback = (schedules: Schedule[]) => void
const allScheduleSubscribers = new Set<SchedulesCallback>()

function notifyAllScheduleSubscribers() {
  allScheduleSubscribers.forEach((cb) => cb([...localSchedules]))
}

/**
 * 전체 일정 실시간 구독 (Cache-First 및 기존 일정 100% 보존)
 */
export function subscribeAllSchedules(
  callback: (schedules: Schedule[]) => void,
  errorCallback?: (error: Error) => void
) {
  allScheduleSubscribers.add(callback)

  // 즉시 전체 데이터 전달
  callback([...localSchedules])

  let hasReceivedSnapshot = false
  const timer = setTimeout(() => {
    if (!hasReceivedSnapshot) {
      callback([...localSchedules])
    }
  }, 1200)

  try {
    const q = query(collection(db, COLLECTIONS.SCHEDULES), orderBy('startAt', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        hasReceivedSnapshot = true
        clearTimeout(timer)
        if (!snapshot.empty) {
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data()
            const id = docSnap.id
            const existing = localSchedules.find((s) => s.id === id)
            if (existing) {
              existing.appliedCount = Number(data.appliedCount) ?? existing.appliedCount
              existing.status = data.status ?? existing.status
            } else {
              localSchedules.unshift({
                id,
                schoolName: data.schoolName || '',
                subject: data.subject || '',
                startAt: data.startAt || Timestamp.now(),
                endAt: data.endAt || Timestamp.now(),
                address: data.address || '',
                latitude: data.latitude,
                longitude: data.longitude,
                requiredCount: Number(data.requiredCount) || 1,
                appliedCount: Number(data.appliedCount) || 0,
                classInfo: data.classInfo || '',
                note: data.note || '',
                status: data.status || 'open',
                createdAt: data.createdAt || Timestamp.now(),
                updatedAt: data.updatedAt,
              })
            }
          })
          saveSchedules()
        }
        callback([...localSchedules])
      },
      (err) => {
        clearTimeout(timer)
        callback([...localSchedules])
        if (errorCallback) errorCallback(err)
      }
    )
    return () => {
      clearTimeout(timer)
      allScheduleSubscribers.delete(callback)
      unsubscribe()
    }
  } catch {
    clearTimeout(timer)
    return () => {
      allScheduleSubscribers.delete(callback)
    }
  }
}

/**
 * 단일 일정 1회 조회 (Cache-First + 로컬 저장소 즉시 폴백)
 */
export async function getScheduleById(id: string): Promise<Schedule | null> {
  // 1. 메모리 캐시 확인
  let found = localSchedules.find((s) => s.id === id)
  if (found) return found

  // 2. 로컬 스토리지 다시 로드 후 확인
  const freshList = getStoredSchedules()
  found = freshList.find((s) => s.id === id)
  if (found) {
    if (!localSchedules.some((s) => s.id === id)) {
      localSchedules.unshift(found)
    }
    return found
  }

  // 3. Firestore 원격 조회
  try {
    const docRef = doc(db, getCollectionPath.schedule(id))
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      const sched: Schedule = {
        id: docSnap.id,
        schoolName: data.schoolName || '',
        subject: data.subject || '',
        startAt: data.startAt || Timestamp.now(),
        endAt: data.endAt || Timestamp.now(),
        address: data.address || '',
        latitude: data.latitude,
        longitude: data.longitude,
        requiredCount: Number(data.requiredCount) || 1,
        appliedCount: Number(data.appliedCount) || 0,
        classInfo: data.classInfo || '',
        note: data.note || '',
        status: data.status || 'open',
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt,
      }
      localSchedules.unshift(sched)
      saveSchedules()
      return sched
    }
  } catch {}

  return null
}

/**
 * [초고속 즉시 등록] 신규 일정 등록 (Optimistic UI - 0초 반영)
 */
export async function createSchedule(formData: ScheduleFormData) {
  if (!formData.schoolName.trim()) throw new Error('학교명을 입력해주세요.')
  if (!formData.subject.trim()) throw new Error('교육과목을 선택하거나 입력해주세요.')
  if (!formData.date) throw new Error('봉사 날짜를 선택해주세요.')
  if (!formData.startTime || !formData.endTime) throw new Error('시작 시간과 종료 시간을 입력해주세요.')
  if (formData.endTime <= formData.startTime) throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.')
  if (formData.requiredCount <= 0) throw new Error('모집 인원은 1명 이상이어야 합니다.')
  if (!formData.address.trim()) throw new Error('주소를 입력해주세요.')

  const startDateTime = dayjs(`${formData.date}T${formData.startTime}:00`)
  const endDateTime = dayjs(`${formData.date}T${formData.endTime}:00`)

  const startAt = Timestamp.fromDate(startDateTime.toDate())
  const endAt = Timestamp.fromDate(endDateTime.toDate())

  const newId = `sched-${Date.now()}`
  const newSched: Schedule = {
    id: newId,
    schoolName: formData.schoolName.trim(),
    subject: formData.subject.trim(),
    startAt,
    endAt,
    address: formData.address.trim(),
    latitude: formData.latitude,
    longitude: formData.longitude,
    requiredCount: Number(formData.requiredCount),
    appliedCount: 0,
    classInfo: formData.classInfo?.trim() || '',
    note: formData.note?.trim() || '',
    status: 'open',
    createdAt: Timestamp.now(),
  }

  // 1. 메모리 및 로컬 스토리지에 즉시 추가 & 0초 브로드캐스트
  localSchedules.unshift(newSched)
  saveSchedules()
  notifyAllScheduleSubscribers()

  // 2. 백그라운드 Firestore 비동기 저장 (동일한 newId로 영구 저장)
  try {
    setDoc(doc(db, COLLECTIONS.SCHEDULES, newId), {
      schoolName: formData.schoolName.trim(),
      subject: formData.subject.trim(),
      startAt,
      endAt,
      address: formData.address.trim(),
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
      requiredCount: Number(formData.requiredCount),
      appliedCount: 0,
      classInfo: formData.classInfo?.trim() || '',
      note: formData.note?.trim() || '',
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {})
  } catch {}

  return newId
}

/**
 * [관리자 전용] 기존 일정 정보 수정
 */
export async function updateSchedule(id: string, formData: ScheduleFormData) {
  if (!formData.schoolName.trim()) throw new Error('학교명을 입력해주세요.')
  if (!formData.subject.trim()) throw new Error('교육과목을 선택하거나 입력해주세요.')
  if (!formData.date) throw new Error('봉사 날짜를 선택해주세요.')
  if (!formData.startTime || !formData.endTime) throw new Error('시작 시간과 종료 시간을 입력해주세요.')
  if (formData.endTime <= formData.startTime) throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.')
  if (formData.requiredCount <= 0) throw new Error('모집 인원은 1명 이상이어야 합니다.')
  if (!formData.address.trim()) throw new Error('주소를 입력해주세요.')

  const startDateTime = dayjs(`${formData.date}T${formData.startTime}:00`)
  const endDateTime = dayjs(`${formData.date}T${formData.endTime}:00`)

  const startAt = Timestamp.fromDate(startDateTime.toDate())
  const endAt = Timestamp.fromDate(endDateTime.toDate())

  const target = localSchedules.find((s) => s.id === id)
  if (target) {
    target.schoolName = formData.schoolName.trim()
    target.subject = formData.subject.trim()
    target.startAt = startAt
    target.endAt = endAt
    target.address = formData.address.trim()
    target.latitude = formData.latitude
    target.longitude = formData.longitude
    target.requiredCount = Number(formData.requiredCount)
    target.classInfo = formData.classInfo?.trim() || ''
    target.note = formData.note?.trim() || ''
    saveSchedules()
    notifyAllScheduleSubscribers()
  }

  try {
    const docRef = doc(db, getCollectionPath.schedule(id))
    updateDoc(docRef, {
      schoolName: formData.schoolName.trim(),
      subject: formData.subject.trim(),
      startAt,
      endAt,
      address: formData.address.trim(),
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
      requiredCount: Number(formData.requiredCount),
      classInfo: formData.classInfo?.trim() || '',
      note: formData.note?.trim() || '',
      updatedAt: serverTimestamp(),
    }).catch(() => {})
  } catch {}
}
