# 도담도담 자원봉사 일정관리 개발 태스크 명세서

> 문서 버전: v1.6  
> 기준 문서: `prd.md` v1.4  
> 작성일: 2026-08-27  
> 개발 범위: MVP  
> 기술 스택: Vue 3 + Vite + Pinia + Vue Router 4 + Tailwind CSS + Firebase Firestore/Auth + Kakao Map SDK

---

## 1. 전체 진행 상황 트래킹

각 태스크 완료 시 체크박스(`- [ ]` -> `- [x]`)를 업데이트하여 진척도를 관리합니다.

- [x] **Phase 1: 프로젝트 셋업 & 정적 Export + Firebase 초기화**
  - [x] 1.1 Vue 3 + Vite (TypeScript, Tailwind CSS v4) 초기화
  - [x] 1.2 `vite.config.ts` 및 정적 배포 설정 (`@tailwindcss/vite`, `@` alias) 설정
  - [x] 1.3 `firebase.json` Hosting(`public: "dist"`) 및 `.env.local` 환경변수 구성
  - [x] 1.4 `src/firebase/config.ts` Firebase Modular SDK 인스턴스 싱글톤 초기화

- [x] **Phase 2: 라우팅, 레이아웃, 세션 상태**
  - [x] 2.1 Vue Router 화면 경로 구성
  - [x] 2.2 상단 고정 헤더와 뒤로가기 동작 구현
  - [x] 2.3 Pinia 기반 봉사자 세션 및 관리자 세션 관리
  - [x] 2.4 자원봉사자 `localStorage` 자동 입장/이름 변경 처리
  - [x] 2.5 관리자 라우트 가드 구현

- [x] **Phase 3: 진입 화면 및 관리자 로그인**
  - [x] 3.1 등록된 봉사자 이름 검색 드롭다운 구현
  - [x] 3.2 선택한 `volunteerId`, `volunteerName`을 `localStorage`에 저장
  - [x] 3.3 재방문 시 `/main` 자동 이동
  - [x] 3.4 Firebase Auth 이메일/비밀번호 관리자 로그인 모달 구현
  - [x] 3.5 지정된 관리자 이메일 2개만 관리자 권한 허용

- [x] **Phase 4: 메인 화면 - 캘린더 및 일정 목록**
  - [x] 4.1 월별 캘린더 그리드 구현
  - [x] 4.2 날짜 칸 일정 칩 표시: `학교명 n/n명 교육내용`
  - [x] 4.3 같은 날 2개 이상 일정 `+n개 더` 모달 구현
  - [x] 4.4 최근 등록된 일정 섹션 구현
  - [x] 4.5 신청 가능한 일정 섹션 구현
  - [x] 4.6 지난 일정/취소 일정/오늘 날짜 스타일 처리

- [x] **Phase 5: 일정 상세 화면 및 카카오맵**
  - [x] 5.1 일정 상세 정보 화면 구현
  - [x] 5.2 6단계 상태 배지 우선순위 계산 및 표시
  - [x] 5.3 카카오맵 SDK 로더와 학교 위치 마커 구현
  - [x] 5.4 좌표 미등록 또는 SDK 실패 시 주소/카카오맵 링크 대체 표시
  - [x] 5.5 실시간 참여자 명단 표시
  - [x] 5.6 관리자 접속 시 수정/일정 취소 액션 표시

- [x] **Phase 6: 참여 신청 및 취소 트랜잭션**
  - [x] 6.1 Firestore Transaction 기반 참여 신청 함수 구현
  - [x] 6.2 봉사자 존재 여부, 일정 상태, 시작 전, 정원, 중복 신청 검증
  - [x] 6.3 Firestore Transaction 기반 신청 취소 함수 구현
  - [x] 6.4 일정 상태 `open`, 시작 전, 신청 문서 존재 여부 검증
  - [x] 6.5 신청/취소 버튼 상태와 실패 메시지 처리

- [x] **Phase 7: 내 일정 화면**
  - [x] 7.1 현재 선택된 봉사자의 신청 일정 조회
  - [x] 7.2 진행중, 다가오는 일정, 지난 일정 정렬 구현
  - [x] 7.3 종료/취소 일정 그레이스케일 처리
  - [x] 7.4 신청 내역 없음 빈 상태 구현

- [x] **Phase 8: 관리자 대시보드**
  - [x] 8.1 관리자 일정 목록 및 상태 필터 구현
  - [x] 8.2 일정 카드 아코디언 구현
  - [x] 8.3 참여자 명단 실시간 조회
  - [x] 8.4 참여자 수동 추가/제거 구현
  - [x] 8.5 참여 확정 처리 및 확정 후 봉사자 신청/취소 잠금

- [x] **Phase 9: 관리자 데이터 관리**
  - [x] 9.1 일정 등록 화면 구현
  - [x] 9.2 카카오맵 장소 검색으로 주소/좌표 입력 보조
  - [x] 9.3 일정 수정 화면 구현
  - [x] 9.4 일정 취소 처리 구현
  - [x] 9.5 자원봉사자 명단 CRUD 구현
  - [x] 9.6 교육내용 과목 CRUD 구현

- [x] **Phase 10: 보안 규칙, QA, 배포**
  - [x] 10.1 Firestore Rules 작성
  - [x] 10.2 MVP 핵심 시나리오 QA (20개 단위 테스트 100% 통과)
  - [x] 10.3 모바일 Safari/Chrome 반응형 확인
  - [x] 10.4 `pnpm build` / `npm run build` 검증
  - [x] 10.5 Firebase Hosting 배포 가이드 (`DEPLOY.md` 작성)

---

## 2. 권장 프로젝트 구조

```text
src/
  main.ts
  App.vue
  router/
    index.ts
  stores/
    session.ts
    schedules.ts
  services/
    firebase.ts
    scheduleService.ts
    applicationService.ts
    volunteerService.ts
    subjectService.ts
    adminAuthService.ts
  types/
    schedule.ts
    volunteer.ts
    subject.ts
    response.ts
  utils/
    datetime.ts
    status.ts
    firestorePaths.ts
    validation.ts
  components/
    layout/
      AppHeader.vue
    calendar/
      CalendarGrid.vue
      CalendarChip.vue
    schedule/
      ScheduleCard.vue
      ApplicationButton.vue
      ParticipantList.vue
    admin/
      AdminScheduleCard.vue
      AdminParticipantManager.vue
      StatusFilterTabs.vue
    map/
      KakaoMap.vue
    modals/
      VolunteerChangeModal.vue
      AdminLoginModal.vue
      ConfirmModal.vue
  views/
    EntryView.vue
    MainView.vue
    ScheduleDetailView.vue
    MySchedulesView.vue
    admin/
      AdminDashboardView.vue
      ScheduleCreateView.vue
      ScheduleEditView.vue
      VolunteersView.vue
      SubjectsView.vue
```

---

## 3. Phase별 상세 구현 명세

### Phase 1: Vue/Vite 프로젝트 셋업 및 Firebase 기반 구성

#### 목표
Vue 3 Composition API 기반의 모바일 퍼스트 SPA를 구성하고 Firebase와 연결합니다.

#### 작업 파일
- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `postcss.config.js`
- `.env.local`
- `firebase.json`
- `firestore.rules`
- `src/main.ts`
- `src/services/firebase.ts`
- `src/utils/firestorePaths.ts`
- `src/utils/datetime.ts`
- `src/utils/status.ts`

#### 구현 내용
- Vue 3 + Vite + TypeScript 프로젝트 초기화
- Tailwind CSS, Pinia, Vue Router 4, Firebase 설치
- Firebase Hosting은 Vite 빌드 결과물인 `dist`를 배포 대상으로 설정
- Firebase SDK는 중복 초기화를 방지하는 싱글톤 형태로 구성
- 환경변수는 Vite 규칙에 맞춰 `VITE_FIREBASE_*`, `VITE_KAKAO_MAP_API_KEY` 사용
- 모든 일시 비교는 Asia/Seoul 기준으로 해석될 수 있도록 `datetime` 유틸에 집중

#### Firebase Hosting 예시
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

### Phase 2: 라우팅, 레이아웃, 세션 상태

#### 목표
PRD의 화면 URL을 Vue Router 기준으로 구성하고, 봉사자/관리자 세션 흐름을 공통화합니다.

#### 라우트
- `/` -> `EntryView.vue`
- `/main` -> `MainView.vue`
- `/schedule/:id` -> `ScheduleDetailView.vue`
- `/my-schedules` -> `MySchedulesView.vue`
- `/admin` -> `admin/AdminDashboardView.vue`
- `/admin/schedule/new` -> `admin/ScheduleCreateView.vue`
- `/admin/schedule/:id/edit` -> `admin/ScheduleEditView.vue`
- `/admin/volunteers` -> `admin/VolunteersView.vue`
- `/admin/subjects` -> `admin/SubjectsView.vue`

#### 구현 내용
- `AppHeader.vue`는 모든 화면 상단에 고정
- 메인/진입 화면을 제외한 하위 화면에서 뒤로가기 버튼 표시
- 자원봉사자 화면에서는 헤더 우측에 `현재 봉사자명 ▾` 표시
- 관리자 화면에서는 `관리자 모드` 배지와 로그아웃 버튼 표시
- Pinia `session` store에 아래 상태 저장
  - `currentVolunteerId`
  - `currentVolunteerName`
  - `adminUser`
  - `isAdmin`
- `localStorage`에 저장된 봉사자 정보가 있으면 앱 시작 시 store에 복원
- 관리자 전용 라우트는 Firebase Auth 상태와 지정 이메일 2개를 확인

---

### Phase 3: 진입 화면 및 관리자 로그인

#### 목표
봉사자는 등록된 이름 중 본인을 선택해 입장하고, 관리자는 Firebase Auth로 로그인합니다.

#### 구현 내용
- `/volunteers` 컬렉션을 조회하여 검색 가능한 드롭다운 구성
- 봉사자 선택 후 입장 시 `volunteerId`, `volunteerName` 저장 후 `/main` 이동
- `localStorage`에 기존 봉사자 정보가 있으면 `/` 접근 시 `/main`으로 이동
- 헤더 이름 클릭 시 `VolunteerChangeModal.vue` 표시
- 이름 변경 시 store와 `localStorage`를 갱신하고 현재 화면 데이터를 새 봉사자 기준으로 갱신
- 관리자 로그인은 이메일/비밀번호 입력 모달로 처리
- Firebase Auth 로그인 성공 후 이메일이 지정된 2개 관리자 이메일 중 하나인지 확인
- 지정 이메일이 아니면 로그아웃 처리 후 관리자 접근 차단

---

### Phase 4: 메인 화면 - 캘린더 및 일정 목록

#### 목표
월별 캘린더, 최근 등록된 일정, 신청 가능한 일정을 한 화면 상단부터 순서대로 제공합니다.

#### 구현 내용
- `MainView.vue`에서 Firestore `schedules`를 실시간 구독
- 월 이동, 오늘 달 이동 기능 구현
- 날짜 칸에 첫 번째 일정 칩 표시
- 같은 날짜 일정이 2개 이상이면 `+n개 더` 표시 후 모달로 전체 목록 제공
- 일정 칩 표기: `학교명 n/n명 교육내용`
- 오늘 날짜는 테두리 또는 배경으로 강조
- `endAt < now` 일정은 그레이스케일 및 낮은 불투명도 적용
- `status == "cancelled"` 일정은 회색 톤과 `취소됨` 텍스트 표시

#### 최근 등록된 일정 조건
- `createdAt >= now - 7일`
- `status == "open"`
- `startAt > now`
- 마감된 일정도 포함
- `NEW` 배지 표시
- 조건에 맞는 일정이 없으면 섹션 자체를 숨김

#### 신청 가능한 일정 조건
- `status == "open"`
- `startAt > now`
- `appliedCount < requiredCount`
- 날짜 오름차순 정렬
- 조건에 맞는 일정이 없으면 `"아직 신청 가능한 일정이 없어요"` 표시

---

### Phase 5: 일정 상세 화면 및 카카오맵

#### 목표
일정 상세 정보, 상태 배지, 신청자 명단, 학교 위치를 조회할 수 있게 합니다.

#### 구현 내용
- `/schedule/:id` 진입 시 해당 일정 문서를 실시간 구독
- 해당 일정의 `responses` 문서를 실시간 구독하여 참여자 명단 표시
- 참여자 명단은 자원봉사자/관리자 모두 조회 가능
- 상태 배지는 아래 우선순위로 1개만 표시
  1. `status == "cancelled"` -> 취소됨
  2. `status == "confirmed"` -> 확정완료
  3. `endAt < now` -> 종료
  4. `startAt <= now < endAt` -> 진행중
  5. `appliedCount >= requiredCount` -> 마감
  6. 그 외 -> 신청가능
- 좌표가 있으면 카카오맵 마커 표시
- 좌표가 없거나 SDK 로드 실패 시 주소 텍스트와 카카오맵 보기 링크 표시
- 자원봉사자 접속 시 신청/취소 버튼 표시
- 관리자 접속 시 신청/취소 버튼 대신 수정/일정 취소 버튼 표시

---

### Phase 6: 참여 신청 및 취소 트랜잭션

#### 목표
동시 신청에서도 정원 초과가 발생하지 않도록 Firestore Transaction으로 처리합니다.

#### 신청 트랜잭션
1. `/volunteers/{volunteerId}` 문서 존재 여부 확인
2. `/schedules/{scheduleId}` 문서 존재 여부 확인
3. 일정의 `status == "open"` 확인
4. `startAt > now` 확인
5. `appliedCount < requiredCount` 확인
6. `/responses/{scheduleId}_{volunteerId}` 문서가 없는지 확인
7. 검증 성공 시 response 문서 생성
8. `schedules.appliedCount` 1 증가
9. `schedules.updatedAt` 갱신

#### 신청 실패 메시지
- 등록된 자원봉사자 아님: `"등록된 자원봉사자만 신청할 수 있습니다."`
- 일정 없음: `"일정을 찾을 수 없습니다."`
- 신청 불가 상태: `"신청 가능한 일정이 아닙니다."`
- 이미 시작됨: `"이미 시작된 일정입니다."`
- 정원 마감: `"마감되었습니다."`
- 중복 신청: `"이미 신청한 일정입니다."`

#### 취소 트랜잭션
1. `/schedules/{scheduleId}` 문서 존재 여부 확인
2. 일정의 `status == "open"` 확인
3. `startAt > now` 확인
4. `/responses/{scheduleId}_{volunteerId}` 문서 존재 여부 확인
5. 검증 성공 시 response 문서 삭제
6. `schedules.appliedCount` 1 감소
7. `schedules.updatedAt` 갱신

#### 취소 실패 메시지
- 신청 내역 없음: `"신청 내역이 없습니다."`
- 확정/취소/종료/시작된 일정: `"신청 취소가 불가능한 일정입니다."`

---

### Phase 7: 내 일정 화면

#### 목표
현재 선택된 봉사자가 신청한 일정을 모아서 보여줍니다.

#### 구현 내용
- `responses`에서 `volunteerId == currentVolunteerId` 조건으로 신청 내역 조회
- 각 response의 `scheduleId` 기준으로 일정 정보 조회
- 정렬 순서
  1. 진행중 일정: `startAt <= now < endAt`
  2. 다가오는 일정: `startAt > now`, 가까운 날짜순
  3. 지난 일정: `endAt <= now`, 최근 지난 날짜순
- 종료/취소 일정은 그레이스케일 처리
- 신청 내역이 없으면 `"신청한 일정이 없어요. 일정을 확인하고 신청해보세요!"` 표시
- 이름 변경 시 즉시 변경된 봉사자 기준으로 목록 갱신

---

### Phase 8: 관리자 대시보드

#### 목표
관리자가 일정 상태, 참여자 명단, 확정 처리를 한 화면에서 관리할 수 있게 합니다.

#### 구현 내용
- 관리자 전용 `/admin` 화면 구현
- 일정 목록 실시간 구독
- 필터: 전체 / 신청가능 / 마감 / 확정완료 / 취소됨 / 종료
- 일정 카드에는 날짜/시간, 학교명, 교육내용, 신청현황, 상태 배지 표시
- 일정 카드 클릭 시 아코디언으로 참여자 명단 영역 표시
- 아코디언 내부 기능
  - 현재 신청자 명단 조회
  - 각 참여자 옆 `X` 버튼으로 제거
  - 등록된 봉사자 중 선택하여 수동 추가
  - 일정 정보 수정 화면 이동
- 수동 추가 시 이미 참여한 봉사자는 선택 불가
- 중복 추가 시도 시 `"이미 참여자 명단에 있습니다."` 표시
- 관리자는 정원을 초과하여 수동 추가 가능
- 참여자 추가/제거 시 `appliedCount`와 `updatedAt` 갱신
- `확정하기` 클릭 시 `status = "confirmed"`, `updatedAt = now`
- 확정 후 봉사자의 자발적 신청/취소는 차단
- 확정 후에도 관리자는 참여자 명단 추가/제거 가능

---

### Phase 9: 관리자 데이터 관리

#### 목표
관리자가 일정, 봉사자 명단, 교육내용을 직접 관리할 수 있게 합니다.

#### 일정 등록
- 학교명 필수
- 주소 필수
- 카카오맵 장소 검색으로 주소/위도/경도 자동 입력 지원
- 좌표 없이 주소만 수동 입력 가능
- 교육내용은 `/subjects`에 등록된 과목 드롭다운에서 선택
- 날짜는 오늘 포함 가능
- `startAt > 현재시각`이어야 저장 가능
- `endAt > startAt`이어야 저장 가능
- 모집 인원은 1명 이상
- 저장 시 아래 기본값 생성
  - `status: "open"`
  - `appliedCount: 0`
  - `createdAt: now`
  - `updatedAt: now`

#### 일정 수정
- 확정/취소 여부와 관계없이 관리자만 수정 가능
- 수정 이력 저장 없이 최신 데이터로 덮어쓰기
- 수정 저장 시 `updatedAt` 갱신
- 기존 신청자 명단은 유지

#### 일정 취소
- 문서를 삭제하지 않음
- `status: "cancelled"`, `updatedAt: now`로 변경
- 기존 신청 데이터는 보존
- 복원 기능은 MVP 제외

#### 자원봉사자 명단 관리
- 이름 추가/삭제 가능
- 삭제 시 기존 response의 `volunteerName` 스냅샷은 보존
- 삭제 후 같은 이름을 다시 등록하면 새 `volunteerId` 생성
- 빈 상태 문구: `"등록된 자원봉사자가 없습니다. 이름을 추가해주세요."`

#### 교육내용 과목 관리
- 과목 추가/삭제 가능
- 과목 삭제 후에도 기존 일정의 `subject` 텍스트는 보존
- 과목이 0개이면 일정 등록 화면에서 과목 추가 안내 표시
- 빈 상태 문구: `"등록된 교육내용이 없습니다. 항목을 추가해야 일정을 등록할 수 있습니다."`

---

## 4. Firestore 데이터 모델

### `/volunteers/{volunteerId}`

```ts
{
  name: string;
  createdAt: Timestamp;
}
```

### `/subjects/{subjectId}`

```ts
{
  name: string;
  createdAt: Timestamp;
}
```

### `/schedules/{scheduleId}`

```ts
{
  schoolName: string;
  subject: string;
  startAt: Timestamp;
  endAt: Timestamp;
  address: string;
  latitude?: number;
  longitude?: number;
  requiredCount: number;
  appliedCount: number;
  classInfo?: string;
  note?: string;
  status: "open" | "confirmed" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `/responses/{scheduleId_volunteerId}`

```ts
{
  scheduleId: string;
  volunteerId: string;
  volunteerName: string;
  createdAt: Timestamp;
}
```

---

## 5. Firestore Rules

MVP는 소규모 신뢰 그룹 운영을 전제로 하며, 봉사자는 Firebase Auth 없이 이름 선택 방식으로 접속합니다. 따라서 신청/취소 권한은 Rules만으로 완전한 본인 인증을 보장할 수 없고, 클라이언트 Transaction으로 정상 사용 흐름의 무결성을 제어합니다.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        (request.auth.token.email == "admin1@dodam.com" ||
         request.auth.token.email == "admin2@dodam.com");
    }

    match /schedules/{scheduleId} {
      allow read: if true;
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /volunteers/{volunteerId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /responses/{responseDocId} {
      allow read: if true;
      allow create, delete: if true;
      allow update: if isAdmin();
    }
  }
}
```

---

## 6. MVP QA 체크리스트

- [ ] 등록된 봉사자만 입장/신청 가능한지 확인
- [ ] 삭제된 봉사자 ID가 `localStorage`에 남아 있을 때 신청이 차단되는지 확인
- [ ] 같은 일정에 중복 신청이 차단되는지 확인
- [ ] 여러 명이 동시에 마지막 자리에 신청해도 정원 초과가 발생하지 않는지 확인
- [ ] 마감 상태에서도 본인 신청 취소가 가능한지 확인
- [ ] 확정 후 봉사자 신청/취소가 차단되는지 확인
- [ ] 관리자는 확정 후에도 참여자 추가/제거가 가능한지 확인
- [ ] 오늘 날짜의 미래 시간 일정은 등록 가능하고, 현재 시각 이전 일정은 등록 불가한지 확인
- [ ] 모든 시간 비교가 Asia/Seoul 기준으로 동작하는지 확인
- [ ] 최근 등록된 일정이 캘린더 아래, 신청 가능한 일정 위에 표시되는지 확인
- [ ] 신청 가능한 일정이 없을 때 빈 상태 문구가 표시되는지 확인
- [ ] 참여자 수동 추가 시 중복 추가가 차단되는지 확인
- [ ] 수동 추가/제거 시 `appliedCount`, `updatedAt`이 갱신되는지 확인
- [ ] 취소된 일정이 삭제되지 않고 명단이 보존되는지 확인
- [ ] 과목이 0개일 때 일정 등록 화면에서 안내가 표시되는지 확인
- [ ] 모바일 375px~430px, 모바일 Safari, 모바일 Chrome에서 주요 화면이 깨지지 않는지 확인

---

## 7. Quick Start

다음 구현 세션에서는 Phase 1부터 진행합니다.

```bash
pnpm create vite . --template vue-ts
pnpm add firebase pinia vue-router
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p
```

빌드 검증:

```bash
pnpm build
```

Firebase Hosting 배포:

```bash
firebase deploy --only hosting,firestore:rules
```

---

## 8. MVP 제외 기능

- Web Push / SMS 알림
- CSV / 엑셀 / PDF 명단 출력
- 수정 이력 저장
- 취소 일정 복원
- 자원봉사자 댓글 / 게시판
- 반복 일정 등록
