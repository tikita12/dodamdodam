# 도담도담 자원봉사 일정관리 개발 태스크 명세서

> **문서 버전**: v2.0 (실운영 고도화 및 최신 기능 완료본)  
> **기준 문서**: `prd.md` v2.0  
> **작성일**: 2026-08-28  
> **개발 상태**: 100% 완료 (Production Ready)  
> **기술 스택**: Vue 3 + Vite + Pinia + Vue Router 4 + Tailwind CSS v4 + Firebase Firestore/Auth + Leaflet/OSM/Kakao Map + Lucide Icons + Vitest

---

## 1. 전체 진행 상황 트래킹 (All Completed)

- [x] **Phase 1: 프로젝트 셋업 & 정적 Export + Firebase 초기화**
  - [x] 1.1 Vue 3 + Vite (TypeScript, Tailwind CSS v4) 초기화
  - [x] 1.2 `vite.config.ts` 및 정적 배포 설정 (`@tailwindcss/vite`, `@` alias) 설정
  - [x] 1.3 `firebase.json` Hosting(`public: "dist"`) 및 `.env.local` 환경변수 구성
  - [x] 1.4 `src/firebase/config.ts` Firebase Modular SDK 인스턴스 싱글톤 초기화

- [x] **Phase 2: 라우팅, 레이아웃, 세션 상태**
  - [x] 2.1 Vue Router 화면 경로 구성
  - [x] 2.2 상단 고정 헤더(`AppHeader.vue`)와 로고 클릭 시 분기점(`/`) 이동 구현
  - [x] 2.3 하단 모바일 고정 네비게이션 바(`AppBottomNav.vue`) 구현 `[홈 | 일정 | 관리자]`
  - [x] 2.4 Pinia 기반 봉사자 세션 및 관리자 세션 완전 분리 (`currentRole: 'admin' | 'volunteer'`)
  - [x] 2.5 관리자 라우트 가드 및 화이트리스트 검증 구현

- [x] **Phase 3: 진입 화면 및 관리자 로그인**
  - [x] 3.1 등록된 15인 봉사자 이름 실시간 검색 드롭다운 구현
  - [x] 3.2 선택한 봉사자 세션 로컬 영속화 및 1초 입장
  - [x] 3.3 Firebase Auth 이메일/비밀번호 관리자 로그인 모달 구현
  - [x] 3.4 관리자 화이트리스트 계정 확장 (`bshine530@gmail.com`, `cwacc@hanmail.net`, `admin2@dodam.com`)

- [x] **Phase 4: 메인 화면 - 캘린더 및 일정 목록**
  - [x] 4.1 월별 캘린더 그리드 및 실시간 일정 렌더링 구현
  - [x] 4.2 캘린더 칩 학교명 스마트 3~4자 축약 (`formatShortSchoolName`)
  - [x] 4.3 취소된 일정 칩 접두사 제거 및 은은한 그레이톤 스타일 처리
  - [x] 4.4 같은 날 2개 이상 일정 `+n개 더` 모달 구현
  - [x] 4.5 최근 등록된 일정 및 신청 가능 일정 섹션 구현

- [x] **Phase 5: 일정 상세 화면 및 인터랙티브 지도**
  - [x] 5.1 일정 상세 정보 화면 및 반응형 라우트 파라미터 감지 구현
  - [x] 5.2 6단계 상태 배지 우선순위 계산 및 표시
  - [x] 5.3 무설정 OpenStreetMap + Leaflet 인터랙티브 맵 엔진 탑재 (실제 도로망/마커/인포윈도우)
  - [x] 5.4 카카오맵 길찾기 바로가기 연동
  - [x] 5.5 실시간 참여자 명단 표시
  - [x] 5.6 관리자 접속 시 일정 수정 및 즉각 일정 취소 액션 구현

- [x] **Phase 6: ⚡ 초고속 참여 신청 및 취소 (Optimistic UI)**
  - [x] 6.1 0.01초 만에 즉각 상태가 변경되는 Optimistic UI 신청/취소 엔진 구현
  - [x] 6.2 **동일 날짜/시간대 중복 신청 원천 차단 (`checkScheduleTimeConflict`)**
  - [x] 6.3 신청자 수 실시간 원자적 카운트 증감 및 백그라운드 Firestore 동기화

- [x] **Phase 7: 내 일정 화면 (`/my-schedules`)**
  - [x] 7.1 현재 선택된 봉사자의 신청 일정 실시간 모아보기
  - [x] 7.2 진행중, 다가오는 일정, 지난 일정 3단계 스마트 정렬
  - [x] 7.3 관리자 접속 시 전체 관리 대시보드로 자동 연결 및 안내

- [x] **Phase 8: 관리자 대시보드 (`/admin`)**
  - [x] 8.1 최신순(내림차순) 전체 일정 정렬
  - [x] 8.2 일정 카드 아코디언 및 실시간 참여자 관리 매니저
  - [x] 8.3 참여자 수동 추가/제거 (0초 반영)
  - [x] 8.4 일정 확정 토글 및 0초 즉각 취소 처리 (`adminCancelSchedule`)

- [x] **Phase 9: 관리자 데이터 및 폼 최적화**
  - [x] 9.1 새 일정 등록 시 학교명 기반 주소/좌표 실시간 자동완성 (Auto-Fill)
  - [x] 9.2 일반 입력창 엔터(Enter) 키에 의한 의도치 않은 자동 폼 제출 원천 차단
  - [x] 9.3 신규 일정 고유 ID 영구 보존 (`setDoc`)으로 상세 화면 조회 100% 보장
  - [x] 9.4 봉사자 명단 0초 즉각 추가/삭제 및 기존 15인 영구 보존 머지 엔진
  - [x] 9.5 교육과목 0초 즉각 추가/삭제 및 기존 4종 영구 보존 머지 엔진

- [x] **Phase 10: 보안 규칙, 테스트 및 GitHub 배포**
  - [x] 10.1 Firestore Rules 최신 관리자 계정(`cwacc@hanmail.net` 등) 반영
  - [x] 10.2 Vitest 단위 테스트 21개 100% 통과 (관리자 검증, 시간 축약, 상태 계산, 세션 동기화)
  - [x] 10.3 GitHub 원격 저장소(`https://github.com/tikita12/dodamdodam`) 생성 및 소스코드 푸시 완료

---

## 2. 핵심 파일 및 모듈 구성

```text
src/
  components/
    admin/
      AdminParticipantManager.vue  # 관리자 참여자 수동 관리
      AdminScheduleCard.vue        # 관리자 일정 아코디언 카드
      StatusFilterTabs.vue         # 상태 필터 탭
    calendar/
      CalendarChip.vue             # 캘린더 축약 스마트 칩 (그레이 처리)
      CalendarGrid.vue             # 월별 캘린더 그리드
    layout/
      AppBottomNav.vue             # 하단 [홈|일정|관리자] 네비게이션
      AppHeader.vue                # 상단 헤더 (로고 분기점 연결)
    map/
      KakaoMap.vue                 # Leaflet/OSM 무설정 인터랙티브 맵
    modals/
      AdminLoginModal.vue          # 관리자 빠른 로그인 모달
      MultiScheduleModal.vue       # 날짜별 복수 일정 모달
    my/
      MyScheduleCard.vue           # 내 일정 카드
    schedule/
      ApplicationButton.vue        # 중복 방지 & 즉각 신청/취소 버튼
      ParticipantList.vue          # 실시간 참여자 목록
      ScheduleCard.vue             # 메인 추천 일정 카드
  services/
    adminAuthService.ts            # Firebase Auth 관리자 인증
    applicationService.ts          # 낙관적 신청/취소 및 중복시간대 검증
    scheduleService.ts             # 24개 기본일정 & 캐시 우선 일정 CRUD
    subjectService.ts              # 4대 교육과목 실시간 관리
    volunteerService.ts            # 15인 봉사자 실시간 관리
  stores/
    session.ts                     # 역할 분리형 반응형 세션 스토어
  utils/
    admin.ts                       # 관리자 이메일 화이트리스트
    datetime.ts                    # 학교명 스마트 축약 및 날짜/시간 유틸
    status.ts                      # 6단계 일정 상태 계산기
```
