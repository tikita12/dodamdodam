import { describe, it, expect } from 'vitest'
import {
  formatFullDate,
  formatShortDate,
  formatTimeRange,
  formatScheduleDateTime,
  isWithinRecentDays,
  isToday,
  isPastSchedule,
  toDayjs,
  formatShortSchoolName,
} from './datetime'
import { Timestamp } from 'firebase/firestore'
import dayjs from 'dayjs'

function makeTimestamp(dateStr: string): Timestamp {
  return Timestamp.fromDate(new Date(dateStr))
}

describe('datetime utility tests', () => {
  it('toDayjs: Timestamp, Date, string 객체를 정확히 Dayjs로 변환해야 한다', () => {
    const ts = makeTimestamp('2026-04-09T10:00:00')
    expect(toDayjs(ts).format('YYYY-MM-DD')).toBe('2026-04-09')

    const d = new Date('2026-04-09T10:00:00')
    expect(toDayjs(d).format('YYYY-MM-DD')).toBe('2026-04-09')

    expect(toDayjs('2026-04-09T10:00:00').format('YYYY-MM-DD')).toBe('2026-04-09')
  })

  it('formatFullDate: 2026년 4월 9일(목) 형식으로 포맷팅되어야 한다', () => {
    const ts = makeTimestamp('2026-04-09T09:50:00')
    const result = formatFullDate(ts)
    expect(result).toBe('2026년 4월 9일(목)')
  })

  it('formatShortDate: 4/9(목) 형식으로 포맷팅되어야 한다', () => {
    const ts = makeTimestamp('2026-04-09T09:50:00')
    const result = formatShortDate(ts)
    expect(result).toBe('4/9(목)')
  })

  it('formatTimeRange: 09:50 ~ 10:30 형식으로 포맷팅되어야 한다', () => {
    const start = makeTimestamp('2026-04-09T09:50:00')
    const end = makeTimestamp('2026-04-09T10:30:00')
    expect(formatTimeRange(start, end)).toBe('09:50 ~ 10:30')
  })

  it('formatScheduleDateTime: 4/9(목) 09:50 ~ 10:30 형식으로 통합 포맷팅되어야 한다', () => {
    const start = makeTimestamp('2026-04-09T09:50:00')
    const end = makeTimestamp('2026-04-09T10:30:00')
    expect(formatScheduleDateTime(start, end)).toBe('4/9(목) 09:50 ~ 10:30')
  })

  it('isWithinRecentDays: 7일 이내 생성된 일정에 대해 true를 반환해야 한다', () => {
    const today = dayjs()
    const fiveDaysAgo = today.subtract(5, 'day')
    const tenDaysAgo = today.subtract(10, 'day')

    expect(isWithinRecentDays(fiveDaysAgo.toDate(), 7)).toBe(true)
    expect(isWithinRecentDays(tenDaysAgo.toDate(), 7)).toBe(false)
  })

  it('isToday: 오늘 날짜인지 여부를 정확히 판별해야 한다', () => {
    expect(isToday(new Date())).toBe(true)
    expect(isToday(dayjs().subtract(1, 'day').toDate())).toBe(false)
  })

  it('isPastSchedule: 종료 시각이 지났는지 여부를 정확히 판별해야 한다', () => {
    const past = dayjs().subtract(1, 'hour').toDate()
    const future = dayjs().add(1, 'hour').toDate()

    expect(isPastSchedule(past)).toBe(true)
    expect(isPastSchedule(future)).toBe(false)
  })

  it('formatShortSchoolName: 학교명을 스마트하게 3~4글자로 축약해야 한다', () => {
    expect(formatShortSchoolName('창원 봉림초등학교')).toBe('봉림초')
    expect(formatShortSchoolName('마산 무학초등학교')).toBe('무학초')
    expect(formatShortSchoolName('진해 덕산초등학교')).toBe('덕산초')
    expect(formatShortSchoolName('봉림초등학교')).toBe('봉림초')
    expect(formatShortSchoolName('창원 상남초등학교')).toBe('상남초')
    expect(formatShortSchoolName('서울 역삼초등학교')).toBe('역삼초')
    expect(formatShortSchoolName('대안여자중학교')).toBe('대안여중')
  })
})
