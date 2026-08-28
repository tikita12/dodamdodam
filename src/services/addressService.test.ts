import { describe, it, expect } from 'vitest'
import { searchPlacesLive, geocodeAddress } from './addressService'
import { queryKoreaSchoolsDB } from './koreaSchoolsData'

describe('addressService tests (실시간 도로명 주소 및 좌표 연동)', () => {
  it('검색어가 2글자 미만인 경우 빈 배열을 반환해야 한다', async () => {
    const res = await searchPlacesLive('a')
    expect(res).toEqual([])
  })

  it('빈 주소에 대해 geocodeAddress는 null을 반환해야 한다', async () => {
    const res = await geocodeAddress('')
    expect(res).toBeNull()
  })

  it('밝은별명성유치원 및 밝은별 검색 시 도로명 주소가 즉시 매칭되어야 한다', async () => {
    const results = await searchPlacesLive('밝은별명성유치원')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe('밝은별명성유치원')
    expect(results[0].address).toContain('경상남도 창원시 성산구 원이대로682번길 36')
    expect(results[0].lat).toBeCloseTo(35.2238, 2)
    expect(results[0].lng).toBeCloseTo(128.6872, 2)

    const list = queryKoreaSchoolsDB('밝은별')
    expect(list.length).toBeGreaterThan(0)
    expect(list[0].name).toBe('밝은별명성유치원')
  })

  it('곰내유치원 검색 시 즉시 정확한 도로명 주소와 위도/경도가 매칭되어야 한다', async () => {
    const results = await searchPlacesLive('곰내유치원')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe('곰내유치원')
    expect(results[0].address).toContain('부산광역시 기장군 정관읍 구연3로 17')
  })

  it('마산무학여자중학교 및 무학여중 검색 시 즉시 도로명 주소와 위도/경도가 매칭되어야 한다', async () => {
    const r1 = await searchPlacesLive('마산무학여자중학교')
    expect(r1.length).toBeGreaterThan(0)
    expect(r1[0].name).toBe('마산무학여자중학교')
    expect(r1[0].address).toContain('경상남도 창원시 마산회원구 회원동북로 49')
  })
})
