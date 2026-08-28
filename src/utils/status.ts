import type { Schedule, ComputedScheduleStatus } from '@/types'
import { toDayjs } from './datetime'
import dayjs from 'dayjs'

export interface StatusBadgeInfo {
  status: ComputedScheduleStatus
  label: string
  bgClass: string
  textClass: string
  borderClass: string
  isGrayscale: boolean
}

/**
 * PRD v1.4 기준 6단계 상태 배지 우선순위 계산 엔진
 * 1. 취소됨 (cancelled)
 * 2. 확정완료 (confirmed)
 * 3. 종료 (endAt < now)
 * 4. 진행중 (startAt <= now < endAt)
 * 5. 마감 (appliedCount >= requiredCount)
 * 6. 신청가능 (open & 자리있음)
 */
export function computeScheduleStatus(schedule: Schedule, now = dayjs()): StatusBadgeInfo {
  const start = toDayjs(schedule.startAt)
  const end = toDayjs(schedule.endAt)

  // 1. 취소됨
  if (schedule.status === 'cancelled') {
    return {
      status: 'cancelled',
      label: '취소됨',
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-500',
      borderClass: 'border-slate-300',
      isGrayscale: true,
    }
  }

  // 2. 확정완료
  if (schedule.status === 'confirmed') {
    return {
      status: 'confirmed',
      label: '확정완료',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      isGrayscale: false,
    }
  }

  // 3. 종료 (endAt < now)
  if (end.isBefore(now)) {
    return {
      status: 'ended',
      label: '종료',
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-400',
      borderClass: 'border-slate-200',
      isGrayscale: true,
    }
  }

  // 4. 진행중 (startAt <= now && now < endAt)
  if (!start.isAfter(now) && end.isAfter(now)) {
    return {
      status: 'in_progress',
      label: '진행중',
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-700',
      borderClass: 'border-purple-200',
      isGrayscale: false,
    }
  }

  // 5. 마감
  if (schedule.appliedCount >= schedule.requiredCount) {
    return {
      status: 'closed',
      label: '마감',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-200',
      isGrayscale: false,
    }
  }

  // 6. 신청가능
  return {
    status: 'open',
    label: '신청가능',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    isGrayscale: false,
  }
}
