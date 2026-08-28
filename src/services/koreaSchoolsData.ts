/**
 * 대한민국 주요 및 지역별 유치원 / 초·중·고등학교 통합 주소 및 좌표 데이터베이스
 */

export interface SchoolAddressEntry {
  name: string
  address: string
  lat: number
  lng: number
  keywords: string[]
}

export const KOREA_SCHOOLS_DATABASE: SchoolAddressEntry[] = [
  // === 경남 창원 유치원 ===
  {
    name: '밝은별명성유치원',
    address: '경상남도 창원시 성산구 원이대로682번길 36',
    lat: 35.2238,
    lng: 128.6872,
    keywords: ['밝은별', '밝은별명성', '밝은별유치원', '명성유치원', '밝은별명성유치원', '상남동밝은별'],
  },
  {
    name: '창원꽃무지풀무지유치원',
    address: '경상남도 창원시 의창구 남산로 27번길 16',
    lat: 35.2573,
    lng: 128.6214,
    keywords: ['꽃무지', '꽃무지풀무지', '창원꽃무지', '풀무지'],
  },
  {
    name: '가람유치원',
    address: '경상남도 창원시 성산구 동산로 124번길 18',
    lat: 35.2198,
    lng: 128.6943,
    keywords: ['가람', '가람유치원', '창원가람'],
  },
  {
    name: '토월유치원',
    address: '경상남도 창원시 성산구 신월로 42',
    lat: 35.2281,
    lng: 128.6892,
    keywords: ['토월', '토월유치원', '창원토월'],
  },
  {
    name: '신비하나름유치원',
    address: '경상남도 창원시 마산회원구 구암서4길 19',
    lat: 35.2341,
    lng: 128.5912,
    keywords: ['신비', '신비한', '하나름', '신비하나름', '신비하나름유치원'],
  },
  {
    name: '용호유치원',
    address: '경상남도 창원시 성산구 용지로 239번길 18',
    lat: 35.2312,
    lng: 128.6811,
    keywords: ['용호', '용호유치원', '창원용호'],
  },
  {
    name: '바른나무유치원',
    address: '경상남도 창원시 마산회원구 양덕로 97',
    lat: 35.2285,
    lng: 128.5834,
    keywords: ['바른나무', '바른나무유치원', '마산바른나무'],
  },
  {
    name: '창원남산유치원',
    address: '경상남도 창원시 의창구 남산로 27번길 12',
    lat: 35.2571,
    lng: 128.6210,
    keywords: ['창원남산유치원', '남산유치원'],
  },
  {
    name: '도솔유치원',
    address: '경상남도 창원시 성산구 사파동 102-1',
    lat: 35.2210,
    lng: 128.7012,
    keywords: ['도솔', '도솔유치원', '사파도솔', '창원도솔'],
  },
  {
    name: '창원한별유치원',
    address: '경상남도 창원시 성산구 반림로 45',
    lat: 35.2384,
    lng: 128.6791,
    keywords: ['창원한별', '한별유치원', '한별', '반림한별'],
  },
  {
    name: '라온유치원',
    address: '경상남도 창원시 마산회원구 합성동 293-1',
    lat: 35.2412,
    lng: 128.5831,
    keywords: ['라온', '라온유치원', '합성라온', '마산라온'],
  },
  {
    name: '감계초등학교 병설유치원',
    address: '경상남도 창원시 의창구 북면 감계로 110번길 33',
    lat: 35.3121,
    lng: 128.5982,
    keywords: ['감계', '감계초', '감계유치원', '감계초병설', '창원감계'],
  },
  {
    name: '대산초등학교 병설유치원',
    address: '경상남도 창원시 의창구 대산면 진산대로 411',
    lat: 35.3412,
    lng: 128.7123,
    keywords: ['대산', '대산초', '대산유치원', '대산초병설', '창원대산'],
  },

  // === 부산 / 기장 / 정관 지역 유치원 및 학교 ===
  {
    name: '곰내유치원',
    address: '부산광역시 기장군 정관읍 구연3로 17',
    lat: 35.3217,
    lng: 129.1764,
    keywords: ['곰내', '곰내유치원', '정관곰내', '기장곰내', '부산곰내'],
  },
  {
    name: '정관유치원',
    address: '부산광역시 기장군 정관읍 산단4로 142',
    lat: 35.3189,
    lng: 129.1823,
    keywords: ['정관유치원', '정관', '기장정관'],
  },
  {
    name: '기장유치원',
    address: '부산광역시 기장군 기장읍 차성로 333번길 18',
    lat: 35.2442,
    lng: 129.2154,
    keywords: ['기장유치원', '기장'],
  },

  // === 경남 창원 마산권 중·고등학교 & 초등학교 ===
  {
    name: '마산무학여자중학교',
    address: '경상남도 창원시 마산회원구 회원동북로 49',
    lat: 35.2215,
    lng: 128.5672,
    keywords: ['마산무학여중', '무학여중', '마산무학여자중', '무학여자중학교', '무학중학교', '회원동무학'],
  },
  {
    name: '마산무학여자고등학교',
    address: '경상남도 창원시 마산회원구 회원동북로 49',
    lat: 35.2215,
    lng: 128.5672,
    keywords: ['마산무학여고', '무학여고', '마산무학여자고', '무학여자고등학교', '무학고등학교'],
  },
  {
    name: '무학초등학교',
    address: '경상남도 창원시 마산합포구 무학로 45',
    lat: 35.2012,
    lng: 128.5634,
    keywords: ['무학', '무학초', '무학초등학교', '마산무학'],
  },
  {
    name: '봉림초등학교',
    address: '경상남도 창원시 의창구 봉림서로 31',
    lat: 35.2536,
    lng: 128.6751,
    keywords: ['봉림', '봉림초', '봉림초등학교', '창원봉림'],
  },
  {
    name: '명도초등학교',
    address: '경상남도 창원시 의창구 명서로 81번길 15',
    lat: 35.2482,
    lng: 128.6431,
    keywords: ['명도', '명도초', '명도초등학교', '창원명도'],
  },
  {
    name: '화양초등학교',
    address: '경상남도 창원시 의창구 동읍 화양길 12',
    lat: 35.2981,
    lng: 128.6982,
    keywords: ['화양', '화양초', '화양초등학교', '동읍화양'],
  },
  {
    name: '자여초등학교',
    address: '경상남도 창원시 의창구 동읍 동읍로 15번길 8',
    lat: 35.2894,
    lng: 128.6875,
    keywords: ['자여', '자여초', '자여초등학교', '동읍자여'],
  },
  {
    name: '용지초등학교',
    address: '경상남도 창원시 성산구 동산로 185',
    lat: 35.2251,
    lng: 128.6914,
    keywords: ['용지', '용지초', '용지초등학교', '창원용지'],
  },
  {
    name: '창원남산초등학교',
    address: '경상남도 창원시 의창구 남산로 27',
    lat: 35.2568,
    lng: 128.6205,
    keywords: ['창원남산초', '남산초등학교', '남산초', '창원남산'],
  },
  {
    name: '북면초등학교',
    address: '경상남도 창원시 의창구 북면 천주로 568',
    lat: 35.3214,
    lng: 128.5873,
    keywords: ['북면', '북면초', '북면초등학교', '창원북면'],
  },
  {
    name: '내동초등학교',
    address: '경상남도 창원시 성산구 충혼로 91',
    lat: 35.2154,
    lng: 128.6653,
    keywords: ['내동', '내동초', '내동초등학교', '창원내동'],
  },
  {
    name: '양곡초등학교',
    address: '경상남도 창원시 성산구 양곡로 66',
    lat: 35.1983,
    lng: 128.6672,
    keywords: ['양곡', '양곡초', '양곡초등학교', '창원양곡'],
  },
  {
    name: '상남초등학교',
    address: '경상남도 창원시 성산구 상남로 88',
    lat: 35.2215,
    lng: 128.6812,
    keywords: ['상남', '상남초', '상남초등학교', '창원상남'],
  },
  {
    name: '신등초등학교',
    address: '경상남도 산청군 신등면 신차로 542',
    lat: 35.3892,
    lng: 127.9941,
    keywords: ['신등', '신등초', '신등초등학교', '산청신등'],
  },
]

/**
 * 데이터베이스 내에서 검색어(학교명, 줄임말, 지역명 등)와 매칭되는 목록 반환
 */
export function queryKoreaSchoolsDB(query: string): SchoolAddressEntry[] {
  const trimmed = query.trim().toLowerCase().replace(/\s+/g, '')
  if (!trimmed) return []

  const strippedQuery = trimmed.replace(
    /(초등학교|여자중학교|남자중학교|중학교|여자고등학교|남자고등학교|고등학교|유치원|학교|여중|남중|여고|남고)/g,
    ''
  )

  return KOREA_SCHOOLS_DATABASE.filter((item) => {
    const normName = item.name.toLowerCase().replace(/\s+/g, '')
    const normAddr = item.address.toLowerCase().replace(/\s+/g, '')

    // 1. 전체 이름 또는 주소 포함 일치
    if (normName.includes(trimmed) || trimmed.includes(normName)) return true
    if (normAddr.includes(trimmed)) return true

    // 2. 키워드 일치
    if (
      item.keywords.some(
        (kw) =>
          kw.toLowerCase().replace(/\s+/g, '').includes(trimmed) ||
          trimmed.includes(kw.toLowerCase().replace(/\s+/g, ''))
      )
    ) {
      return true
    }

    // 3. 핵심 단어 스마트 매칭 (예: '밝은별', '무학여중' 등)
    if (strippedQuery.length >= 2) {
      const strippedName = normName.replace(
        /(초등학교|여자중학교|남자중학교|중학교|여자고등학교|남자고등학교|고등학교|유치원|학교|여중|남중|여고|남고)/g,
        ''
      )
      if (strippedName.includes(strippedQuery) || strippedQuery.includes(strippedName)) {
        return true
      }
    }

    return false
  })
}
