import dayjs from 'dayjs'
import type { Timestamp } from 'firebase/firestore'

/**
 * Timestamp 또는 Date를 Dayjs 인스턴스로 변환
 */
export function toDayjs(val: Timestamp | Date | string | number | null | undefined): dayjs.Dayjs {
  if (!val) return dayjs()
  if (typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return dayjs((val as { toDate: () => Date }).toDate())
  }
  if (val instanceof Date || typeof val === 'string' || typeof val === 'number') {
    return dayjs(val)
  }
  return dayjs()
}

/**
 * 일정 날짜 및 요일 포맷 (예: 2026년 4월 9일(목))
 */
export function formatFullDate(val: Timestamp | Date | string): string {
  const d = toDayjs(val)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = days[d.day()]
  return `${d.format('YYYY년 M월 D일')}(${dayName})`
}

/**
 * 캘린더/목록용 간단 날짜 및 요일 포맷 (예: 4/9(목))
 */
export function formatShortDate(val: Timestamp | Date | string): string {
  const d = toDayjs(val)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = days[d.day()]
  return `${d.format('M/D')}(${dayName})`
}

/**
 * 시간 범위 포맷 (예: 09:50 ~ 10:30)
 */
export function formatTimeRange(start: Timestamp | Date | string, end: Timestamp | Date | string): string {
  return `${toDayjs(start).format('HH:mm')} ~ ${toDayjs(end).format('HH:mm')}`
}

/**
 * 날짜 및 시간 범위 통합 포맷 (예: 4/9(목) 09:50 ~ 10:30)
 */
export function formatScheduleDateTime(start: Timestamp | Date | string, end: Timestamp | Date | string): string {
  return `${formatShortDate(start)} ${formatTimeRange(start, end)}`
}

/**
 * 최근 7일 이내 등록 여부 확인
 */
export function isWithinRecentDays(createdAt: Timestamp | Date | string, days = 7): boolean {
  const created = toDayjs(createdAt)
  const threshold = dayjs().subtract(days, 'day').startOf('day')
  return created.isAfter(threshold)
}

/**
 * 오늘 날짜 여부 확인
 */
export function isToday(val: Timestamp | Date | string): boolean {
  return toDayjs(val).isSame(dayjs(), 'day')
}

/**
 * 종료 시각이 지났는지 여부 확인 (endAt < now)
 */
export function isPastSchedule(endAt: Timestamp | Date | string): boolean {
  return toDayjs(endAt).isBefore(dayjs())
}

/**
 * 캘린더 칩용 학교/유치원명 스마트 축약 (예: '창원 봉림초등학교' -> '봉림초', '가람유치원' -> '가람유')
 */
export function formatShortSchoolName(name: string): string {
  if (!name) return ''
  let clean = name.trim()

  // 1. 앞의 시/구/지역명 수식어 제거
  clean = clean.replace(/^(창원시|마산합포구|마산회원구|성산구|의창구|진해구|창원|마산|진해|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*/g, '')

  // 2. 병설유치원 축약 (예: 감계초등학교 병설유치원 -> 감계유)
  clean = clean.replace(/(초등학교|초등|초)?\s*(병설)?유치원/g, '유')

  // 3. 학교 분류 축약
  clean = clean.replace(/초등학교/g, '초')
  clean = clean.replace(/여자중학교/g, '여중')
  clean = clean.replace(/남자중학교/g, '남중')
  clean = clean.replace(/중학교/g, '중')
  clean = clean.replace(/여자고등학교/g, '여고')
  clean = clean.replace(/남자고등학교/g, '남고')
  clean = clean.replace(/고등학교/g, '고')

  // 4. 긴 유치원 이름 예외 처리 (예: 꽃무지풀무지유 -> 꽃무지유, 신비하나름유 -> 신비유)
  if (clean.startsWith('꽃무지')) return '꽃무지유'
  if (clean.startsWith('신비')) return '신비유'
  if (clean.startsWith('바른나무')) return '바른유'

  return clean.trim()
}
