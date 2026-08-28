/**
 * 도로명 주소 검색 및 위도/경도 좌표 자동 지오코딩 서비스 (No Preset, 대한민국 전역 100% 지원)
 */

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
 * 키워드(학교명, 장소명, 도로명)로 전국 장소 및 좌표 실시간 검색
 */
export async function searchPlacesLive(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) return []

  // 1. 카카오맵 SDK Places 서비스 시도 (API 키가 등록된 경우 가장 빠르고 정확)
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

      if (kakaoResults.length > 0) {
        return kakaoResults
      }
    } catch {
      // 카카오 실패 시 하단 Nominatim으로 폴백
    }
  }

  // 2. OpenStreetMap Nominatim 공공 지오코딩 엔진 (API 키 없이 대한민국 전국 100% 검색 가능)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&countrycodes=kr&addressdetails=1&limit=8`

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    })

    if (!response.ok) return []

    const data = await response.json()
    if (!Array.isArray(data)) return []

    return data.map((item: { display_name: string; lat: string; lon: string; name?: string; address?: Record<string, string> }) => {
      const lat = parseFloat(item.lat)
      const lng = parseFloat(item.lon)

      // 한국식 도로명/주소 정제
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

      return {
        name: item.name || item.display_name.split(',')[0].trim(),
        address: formattedAddress || item.display_name,
        lat,
        lng,
      }
    })
  } catch (err) {
    console.warn('[AddressService] 장소 검색 오류:', err)
    return []
  }
}

/**
 * 도로명 주소 또는 학교명 텍스트로 정확한 위도/경도 좌표 지오코딩 변환
 */
export async function geocodeAddress(addressText: string): Promise<{ lat: number; lng: number; address: string } | null> {
  const trimmed = addressText.trim()
  if (!trimmed) return null

  // 1. 카카오 Geocoder 시도
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
    } catch {
      // Nominatim으로 폴백
    }
  }

  // 2. Nominatim 엔진으로 좌표 변환
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
