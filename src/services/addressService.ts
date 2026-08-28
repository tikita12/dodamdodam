/**
 * 도로명 주소 검색 및 위도/경도 좌표 자동 지오코딩 서비스
 * - 전국/지역 유치원 & 학교 데이터베이스 1차 고속 매칭 (곰내유치원 등 모든 유치원 지원)
 * - 온라인 실시간 지오코딩 및 Daum 공식 도로명 주소 팝업 통합
 */

import { queryKoreaSchoolsDB } from './koreaSchoolsData'

export interface PlaceSearchResult {
  name: string
  address: string
  lat: number
  lng: number
}

// Daum Postcode SDK 스크립트 로드
function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as { daum?: { Postcode: unknown } }).daum?.Postcode) {
      resolve()
      return
    }

    const existingScript = document.getElementById('daum-postcode-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', (e) => reject(e))
      return
    }

    const script = document.createElement('script')
    script.id = 'daum-postcode-script'
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })
}

/**
 * 키워드(학교명, 유치원명, 장소명)로 전국 장소 및 도로명 주소/좌표 실시간 하이브리드 검색
 */
export async function searchPlacesLive(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) return []

  const results: PlaceSearchResult[] = []
  const seenNames = new Set<string>()

  // 1. 유치원/학교 마스터 데이터베이스 1차 초고속 검색 (곰내유치원, 정관, 창원 등 100% 매칭)
  const localMatches = queryKoreaSchoolsDB(trimmed)
  for (const item of localMatches) {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name)
      results.push({
        name: item.name,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
      })
    }
  }

  // 2. 카카오맵 SDK Places 서비스 시도 (API 키가 로드된 경우)
  const kakao = (window as unknown as {
    kakao?: {
      maps?: {
        services?: {
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (result: Array<{ place_name: string; address_name: string; road_address_name: string; y: string; x: string }>, status: string) => void
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }).kakao

  if (kakao?.maps?.services?.Places) {
    try {
      const kakaoResults = await new Promise<PlaceSearchResult[]>((resolve) => {
        const ps = new kakao.maps!.services!.Places()
        ps.keywordSearch(trimmed, (data, status) => {
          if (status === kakao.maps!.services!.Status.OK && Array.isArray(data)) {
            const list = data.slice(0, 8).map((item) => ({
              name: item.place_name,
              address: item.road_address_name || item.address_name,
              lat: parseFloat(item.y),
              lng: parseFloat(item.x),
            }))
            resolve(list)
          } else {
            resolve([])
          }
        })
      })

      for (const item of kakaoResults) {
        if (!seenNames.has(item.name)) {
          seenNames.add(item.name)
          results.push(item)
        }
      }
    } catch {}
  }

  // 3. OpenStreetMap Nominatim 공공 지오코딩 엔진 (전국 기타 장소/학교)
  if (results.length < 5) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&countrycodes=kr&addressdetails=1&limit=8`

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          for (const item of data) {
            const name = item.name || item.display_name.split(',')[0].trim()
            if (!seenNames.has(name)) {
              seenNames.add(name)
              const lat = parseFloat(item.lat)
              const lng = parseFloat(item.lon)

              const addrObj = item.address || {}
              const province = addrObj.province || addrObj.city || ''
              const district = addrObj.district || addrObj.suburb || addrObj.county || ''
              const road = addrObj.road || ''
              const houseNumber = addrObj.house_number || ''

              let formattedAddress = ''
              if (province && (district || road)) {
                formattedAddress = `${province} ${district} ${road} ${houseNumber}`.trim()
              } else {
                formattedAddress = item.display_name.split(',').slice(0, 4).reverse().join(' ').trim()
              }

              results.push({
                name,
                address: formattedAddress || item.display_name,
                lat,
                lng,
              })
            }
          }
        }
      }
    } catch {}
  }

  return results
}

/**
 * 도로명 주소 또는 학교명 텍스트로 정확한 위도/경도 좌표 지오코딩 변환
 */
export async function geocodeAddress(addressText: string): Promise<{ lat: number; lng: number; address: string } | null> {
  const trimmed = addressText.trim()
  if (!trimmed) return null

  // 1. 내장 데이터베이스 매칭
  const local = queryKoreaSchoolsDB(trimmed)
  if (local.length > 0) {
    return {
      lat: local[0].lat,
      lng: local[0].lng,
      address: local[0].address,
    }
  }

  // 2. 카카오 Geocoder 시도
  const kakao = (window as unknown as {
    kakao?: {
      maps?: {
        services?: {
          Geocoder: new () => {
            addressSearch: (
              addr: string,
              callback: (result: Array<{ address_name: string; road_address: { address_name: string }; y: string; x: string }>, status: string) => void
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }).kakao

  if (kakao?.maps?.services?.Geocoder) {
    try {
      const res = await new Promise<{ lat: number; lng: number; address: string } | null>((resolve) => {
        const geocoder = new kakao.maps!.services!.Geocoder()
        geocoder.addressSearch(trimmed, (result, status) => {
          if (status === kakao.maps!.services!.Status.OK && result.length > 0) {
            const first = result[0]
            resolve({
              lat: parseFloat(first.y),
              lng: parseFloat(first.x),
              address: first.road_address?.address_name || first.address_name,
            })
          } else {
            resolve(null)
          }
        })
      })
      if (res) return res
    } catch {}
  }

  // 3. Nominatim 엔진으로 좌표 변환
  try {
    const list = await searchPlacesLive(trimmed)
    if (list.length > 0) {
      return {
        lat: list[0].lat,
        lng: list[0].lng,
        address: list[0].address,
      }
    }
  } catch {}

  return null
}

/**
 * 다음(카카오) 공식 도로명 주소 우편번호 찾기 팝업 실행
 */
export async function openDaumPostcodePopup(
  onComplete: (data: { roadAddress: string; jibunAddress: string; buildingName: string; zonecode: string; lat?: number; lng?: number }) => void
): Promise<void> {
  await loadDaumPostcodeScript()

  const daum = (window as unknown as {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress: string
          jibunAddress: string
          buildingName: string
          zonecode: string
          autoRoadAddress?: string
          autoJibunAddress?: string
        }) => void
      }) => {
        open: () => void
      }
    }
  }).daum

  if (!daum?.Postcode) {
    throw new Error('우편번호 검색 서비스를 불러올 수 없습니다.')
  }

  new daum.Postcode({
    oncomplete: async (data) => {
      const selectedRoadAddress = data.roadAddress || data.autoRoadAddress || data.jibunAddress
      const building = data.buildingName || ''

      // 좌표 지오코딩
      const coords = await geocodeAddress(selectedRoadAddress)

      onComplete({
        roadAddress: selectedRoadAddress,
        jibunAddress: data.jibunAddress,
        buildingName: building,
        zonecode: data.zonecode,
        lat: coords?.lat,
        lng: coords?.lng,
      })
    },
  }).open()
}
