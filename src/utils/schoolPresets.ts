export interface SchoolPreset {
  name: string
  address: string
  lat: number
  lng: number
  keywords?: string[]
}

export const SCHOOL_PRESETS: SchoolPreset[] = [
  {
    name: '감계초등학교 병설유치원',
    address: '경남 창원시 의창구 북면 감계로 110번길 33',
    lat: 35.3121,
    lng: 128.5982,
    keywords: ['감계', '감계초', '감계유치원', '감계초병설'],
  },
  {
    name: '창원꽃무지풀무지유치원',
    address: '경남 창원시 의창구 남산로 27번길 16',
    lat: 35.2573,
    lng: 128.6214,
    keywords: ['꽃무지', '꽃무지풀무지', '창원꽃무지'],
  },
  {
    name: '봉림초등학교',
    address: '경남 창원시 의창구 봉림서로 31',
    lat: 35.2536,
    lng: 128.6751,
    keywords: ['봉림', '봉림초'],
  },
  {
    name: '가람유치원',
    address: '경남 창원시 성산구 동산로 124번길 18',
    lat: 35.2198,
    lng: 128.6943,
    keywords: ['가람', '가람유치원'],
  },
  {
    name: '명도초등학교',
    address: '경남 창원시 의창구 명서로 81번길 15',
    lat: 35.2482,
    lng: 128.6431,
    keywords: ['명도', '명도초'],
  },
  {
    name: '화양초등학교',
    address: '경남 창원시 의창구 동읍 화양길 12',
    lat: 35.2981,
    lng: 128.6982,
    keywords: ['화양', '화양초'],
  },
  {
    name: '자여초등학교',
    address: '경남 창원시 의창구 동읍 동읍로 15번길 8',
    lat: 35.2894,
    lng: 128.6875,
    keywords: ['자여', '자여초'],
  },
  {
    name: '토월유치원',
    address: '경남 창원시 성산구 신월로 42',
    lat: 35.2281,
    lng: 128.6892,
    keywords: ['토월', '토월유치원'],
  },
  {
    name: '신비하나름유치원',
    address: '경남 창원시 마산회원구 구암서4길 19',
    lat: 35.2341,
    lng: 128.5912,
    keywords: ['신비', '신비한', '하나름', '신비하나름'],
  },
  {
    name: '용호유치원',
    address: '경남 창원시 성산구 용지로 239번길 18',
    lat: 35.2312,
    lng: 128.6811,
    keywords: ['용호', '용호유치원'],
  },
  {
    name: '대산초등학교 병설유치원',
    address: '경남 창원시 의창구 대산면 진산대로 411',
    lat: 35.3412,
    lng: 128.7123,
    keywords: ['대산', '대산초', '대산유치원', '대산초병설'],
  },
  {
    name: '신등초등학교',
    address: '경남 산청군 신등면 신차로 542',
    lat: 35.3892,
    lng: 127.9941,
    keywords: ['신등', '신등초'],
  },
  {
    name: '바른나무유치원',
    address: '경남 창원시 마산회원구 양덕로 97',
    lat: 35.2285,
    lng: 128.5834,
    keywords: ['바른나무', '바른나무유치원'],
  },
  {
    name: '용지초등학교',
    address: '경남 창원시 성산구 동산로 185',
    lat: 35.2251,
    lng: 128.6914,
    keywords: ['용지', '용지초'],
  },
  {
    name: '창원남산초등학교',
    address: '경남 창원시 의창구 남산로 27',
    lat: 35.2568,
    lng: 128.6205,
    keywords: ['창원남산초', '남산초등학교', '남산초'],
  },
  {
    name: '북면초등학교',
    address: '경남 창원시 의창구 북면 천주로 568',
    lat: 35.3214,
    lng: 128.5873,
    keywords: ['북면', '북면초'],
  },
  {
    name: '창원남산유치원',
    address: '경남 창원시 의창구 남산로 27번길 12',
    lat: 35.2571,
    lng: 128.6210,
    keywords: ['창원남산유치원', '남산유치원'],
  },
  {
    name: '도솔유치원',
    address: '경남 창원시 성산구 사파동 102-1',
    lat: 35.2210,
    lng: 128.7012,
    keywords: ['도솔', '도솔유치원'],
  },
  {
    name: '창원한별유치원',
    address: '경남 창원시 성산구 반림로 45',
    lat: 35.2384,
    lng: 128.6791,
    keywords: ['창원한별', '한별유치원', '한별'],
  },
  {
    name: '내동초등학교',
    address: '경남 창원시 성산구 충혼로 91',
    lat: 35.2154,
    lng: 128.6653,
    keywords: ['내동', '내동초'],
  },
  {
    name: '라온유치원',
    address: '경남 창원시 마산회원구 합성동 293-1',
    lat: 35.2412,
    lng: 128.5831,
    keywords: ['라온', '라온유치원'],
  },
  {
    name: '양곡초등학교',
    address: '경남 창원시 성산구 양곡로 66',
    lat: 35.1983,
    lng: 128.6672,
    keywords: ['양곡', '양곡초'],
  },
  {
    name: '상남초등학교',
    address: '경남 창원시 성산구 상남로 88',
    lat: 35.2215,
    lng: 128.6812,
    keywords: ['상남', '상남초'],
  },
  {
    name: '무학초등학교',
    address: '경남 창원시 마산합포구 무학로 45',
    lat: 35.2012,
    lng: 128.5634,
    keywords: ['무학', '무학초'],
  },
]

/**
 * 학교명 정규화 (공백 제거 및 소문자 변환)
 */
function normalizeName(str: string): string {
  return str.replace(/\s+/g, '').toLowerCase()
}

/**
 * 학교/유치원 핵심 이름 추출 (초등학교/유치원/병설유치원 등 일반 접미사 제거)
 */
export function getCoreSchoolName(name: string): string {
  return name.replace(/(초등학교|병설유치원|유치원|학교)/g, '').trim()
}

/**
 * 사용자가 입력한 학교명에 가장 적합한 프리셋 조회
 */
export function findSchoolPreset(input: string): SchoolPreset | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const normInput = normalizeName(trimmed)
  const coreInput = getCoreSchoolName(trimmed)

  // 1. 정확한 이름 일치
  const exact = SCHOOL_PRESETS.find((p) => p.name === trimmed || normalizeName(p.name) === normInput)
  if (exact) return exact

  // 2. 키워드 일치
  const keywordMatch = SCHOOL_PRESETS.find((p) => {
    return p.keywords?.some((kw) => kw === trimmed || normalizeName(kw) === normInput)
  })
  if (keywordMatch) return keywordMatch

  // 3. 핵심 단어 기반 매칭 (핵심 단어가 2글자 이상일 때)
  if (coreInput.length >= 2) {
    const coreMatch = SCHOOL_PRESETS.find((p) => {
      const pCore = getCoreSchoolName(p.name)
      return pCore.includes(coreInput) || coreInput.includes(pCore)
    })
    if (coreMatch) return coreMatch
  }

  return null
}

/**
 * 실시간 검색 추천 목록 반환 (자동완성 드롭다운용)
 */
export function searchSchoolPresets(query: string): SchoolPreset[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const normQ = normalizeName(trimmed)
  const coreQ = getCoreSchoolName(trimmed)

  return SCHOOL_PRESETS.filter((p) => {
    const normName = normalizeName(p.name)
    if (normName.includes(normQ)) return true
    if (p.keywords?.some((kw) => normalizeName(kw).includes(normQ) || normQ.includes(normalizeName(kw)))) return true
    if (coreQ.length >= 2 && getCoreSchoolName(p.name).includes(coreQ)) return true
    return false
  })
}
