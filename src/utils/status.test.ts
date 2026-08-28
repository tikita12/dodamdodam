import { describe, it, expect } from 'vitest'
import { computeScheduleStatus } from './status'
import type { Schedule } from '@/types'
import { Timestamp } from 'firebase/firestore'
import dayjs from 'dayjs'

function makeTimestamp(dateStr: string): Timestamp {
  const d = new Date(dateStr)
  return Timestamp.fromDate(d)
}

describe('computeScheduleStatus (6단계 상태 배지 우선순위 검증)', () => {
  const now = dayjs('2026-04-10T10:00:00')

  it('1순위: status == "cancelled" 이면 종료/마감 여부 상관없이 "취소됨" 반환', () => {
    const schedule: Schedule = {
      id: '1',
      schoolName: '봉림초',
      subject: '도박예방',
      startAt: makeTimestamp('2026-04-01T09:00:00'),
      endAt: makeTimestamp('2026-04-01T10:00:00'),
      address: '창원시',
      requiredCount: 3,
      appliedCount: 3,
      status: 'cancelled',
      createdAt: makeTimestamp('2026-03-20T00:00:00'),
    }
    const result = computeScheduleStatus(schedule, now)
    expect(result.status).toBe('cancelled')
    expect(result.label).toBe('취소됨')
    expect(result.isGrayscale).toBe(true)
  })

  it('2순위: status == "confirmed" 이면 "확정완료" 반환', () => {
    const schedule: Schedule = {
      id: '2',
      schoolName: '봉림초',
      subject: '도박예방',
      startAt: makeTimestamp('2026-04-15T09:00:00'),
      endAt: makeTimestamp('2026-04-15T10:00:00'),
      address: '창원시',
      requiredCount: 3,
      appliedCount: 3,
      status: 'confirmed',
      createdAt: makeTimestamp('2026-04-01T00:00:00'),
    }
    const result = computeScheduleStatus(schedule, now)
    expect(result.status).toBe('confirmed')
    expect(result.label).toBe('확정완료')
    expect(result.isGrayscale).toBe(false)
  })

  it('3순위: endAt < now 이면 "종료" 반환 (그레이스케일)', () => {
    const schedule: Schedule = {
      id: '3',
      schoolName: '봉림초',
      subject: '도박예방',
      startAt: makeTimestamp('2026-04-09T09:00:00'),
      endAt: makeTimestamp('2026-04-09T10:00:00'),
      address: '창원시',
      requiredCount: 3,
      appliedCount: 1,
      status: 'open',
      createdAt: makeTimestamp('2026-04-01T00:00:00'),
    }
    const result = computeScheduleStatus(schedule, now)
    expect(result.status).toBe('ended')
    expect(result.label).toBe('종료')
    expect(result.isGrayscale).toBe(true)
  })

  it('4순위: startAt <= now < endAt 이면 "진행중" 반환', () => {
    const schedule: Schedule = {
      id: '4',
      schoolName: '봉림초',
      subject: '도박예방',
      startAt: makeTimestamp('2026-04-10T09:30:00'),
      endAt: makeTimestamp('2026-04-10T11:00:00'),
      address: '창원시',
      requiredCount: 3,
      appliedCount: 2,
      status: 'open',
      createdAt: makeTimestamp('2026-04-01T00:00:00'),
    }
    const result = computeScheduleStatus(schedule, now)
    expect(result.status).toBe('in_progress')
    expect(result.label).toBe('진행중')
  })

  it('5순위: appliedCount >= requiredCount 이면 "마감" 반환', () => {
    const schedule: Schedule = {
      id: '5',
      schoolName: '봉림초',
      subject: '도박예방',
      startAt: makeTimestamp('2026-04-15T09:00:00'),
      endAt: makeTimestamp('2026-04-15T10:00:00'),
      address: '창원시',
      requiredCount: 3,
      appliedCount: 3,
      status: 'open',
      createdAt: makeTimestamp('2026-04-01T00:00:00'),
    }
    const result = computeScheduleStatus(schedule, now)
    expect(result.status).toBe('closed')
    expect(result.label).toBe('마감')
  })

  it('6순위: 그 외(정원 미만, 시작 전)이면 "신청가능" 반환', () => {
    const schedule: Schedule = {
      id: '6',
      schoolName: '봉림초',
      subject: '도박예방',
      startAt: makeTimestamp('2026-04-15T09:00:00'),
      endAt: makeTimestamp('2026-04-15T10:00:00'),
      address: '창원시',
      requiredCount: 3,
      appliedCount: 1,
      status: 'open',
      createdAt: makeTimestamp('2026-04-01T00:00:00'),
    }
    const result = computeScheduleStatus(schedule, now)
    expect(result.status).toBe('open')
    expect(result.label).toBe('신청가능')
  })
})
