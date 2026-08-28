import { describe, it, expect, vi } from 'vitest'
import { searchPlacesLive, geocodeAddress } from './addressService'

describe('addressService tests (실시간 도로명 주소 및 좌표 연동)', () => {
  it('검색어가 2글자 미만인 경우 빈 배열을 반환해야 한다', async () => {
    const res = await searchPlacesLive('a')
    expect(res).toEqual([])
  })

  it('빈 주소에 대해 geocodeAddress는 null을 반환해야 한다', async () => {
    const res = await geocodeAddress('')
    expect(res).toBeNull()
  })

  it('전국 학교명 검색 시 실제 도로명 주소 및 좌표 객체 구조를 반환해야 한다', async () => {
    // Mock global fetch for reliable test runs
    const mockData = [
      {
        display_name: '봉림초등학교, 봉림서로, 의창구, 창원시, 경상남도, 대한민국',
        name: '봉림초등학교',
        lat: '35.2536',
        lon: '128.6751',
        address: {
          province: '경상남도',
          city: '창원시',
          district: '의창구',
          road: '봉림서로 31',
        },
      },
    ]

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const results = await searchPlacesLive('봉림초등학교')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe('봉림초등학교')
    expect(results[0].lat).toBeCloseTo(35.2536)
    expect(results[0].lng).toBeCloseTo(128.6751)
    expect(results[0].address).toContain('봉림서로')

    fetchSpy.mockRestore()
  })
})
