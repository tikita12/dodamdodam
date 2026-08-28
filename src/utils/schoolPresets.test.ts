import { describe, it, expect } from 'vitest'
import { findSchoolPreset, searchSchoolPresets, getCoreSchoolName, SCHOOL_PRESETS } from './schoolPresets'

describe('schoolPresets utility tests', () => {
  it('모든 24개 학교 프리셋이 유효한 주소와 좌표를 가지고 있어야 한다', () => {
    expect(SCHOOL_PRESETS.length).toBeGreaterThanOrEqual(24)
    SCHOOL_PRESETS.forEach((preset) => {
      expect(preset.name).toBeTruthy()
      expect(preset.address).toBeTruthy()
      expect(preset.lat).toBeGreaterThan(30)
      expect(preset.lng).toBeGreaterThan(120)
    })
  })

  it('정확한 학교명으로 프리셋을 찾을 수 있어야 한다', () => {
    const p1 = findSchoolPreset('감계초등학교 병설유치원')
    expect(p1).not.toBeNull()
    expect(p1?.address).toContain('감계로')

    const p2 = findSchoolPreset('봉림초등학교')
    expect(p2).not.toBeNull()
    expect(p2?.address).toContain('봉림서로')
  })

  it('핵심 키워드나 줄임말로도 프리셋을 찾을 수 있어야 한다', () => {
    const p1 = findSchoolPreset('봉림초')
    expect(p1).not.toBeNull()
    expect(p1?.name).toBe('봉림초등학교')

    const p2 = findSchoolPreset('가람유치원')
    expect(p2).not.toBeNull()
    expect(p2?.name).toBe('가람유치원')

    const p3 = findSchoolPreset('꽃무지')
    expect(p3).not.toBeNull()
    expect(p3?.name).toBe('창원꽃무지풀무지유치원')
  })

  it('일치하지 않는 임의의 학교명은 null을 반환해야 한다', () => {
    const p = findSchoolPreset('완전새로운학교')
    expect(p).toBeNull()
  })

  it('getCoreSchoolName: 학교명에서 일반 접미사를 제거하고 핵심 명칭을 반환해야 한다', () => {
    expect(getCoreSchoolName('봉림초등학교')).toBe('봉림')
    expect(getCoreSchoolName('가람유치원')).toBe('가람')
    expect(getCoreSchoolName('감계초등학교 병설유치원')).toBe('감계')
  })

  it('searchSchoolPresets로 검색어 자동완성 목록을 필터링해야 한다', () => {
    const list1 = searchSchoolPresets('남산')
    expect(list1.length).toBeGreaterThanOrEqual(2) // 창원남산초등학교, 창원남산유치원
    expect(list1.some((s) => s.name === '창원남산초등학교')).toBe(true)

    const list2 = searchSchoolPresets('유치원')
    expect(list2.length).toBeGreaterThan(5)

    const empty = searchSchoolPresets('')
    expect(empty).toEqual([])
  })
})
