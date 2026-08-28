import type { Timestamp } from 'firebase/firestore'

export type ScheduleStatus = 'open' | 'confirmed' | 'cancelled'

export type ComputedScheduleStatus =
  | 'cancelled'  // 취소됨 (우선순위 1)
  | 'confirmed'  // 확정완료 (우선순위 2)
  | 'ended'      // 종료 (우선순위 3)
  | 'in_progress'// 진행중 (우선순위 4)
  | 'closed'     // 마감 (우선순위 5)
  | 'open'       // 신청가능 (우선순위 6)

export interface Schedule {
  id: string
  schoolName: string
  subject: string
  startAt: Timestamp
  endAt: Timestamp
  address: string
  latitude?: number
  longitude?: number
  requiredCount: number
  appliedCount: number
  classInfo?: string
  note?: string
  status: ScheduleStatus
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface ScheduleFormData {
  schoolName: string
  subject: string
  date: string
  startTime: string
  endTime: string
  address: string
  latitude?: number
  longitude?: number
  requiredCount: number
  classInfo?: string
  note?: string
}
