# 🌱 도담도담 자원봉사 일정관리 시스템 (DodamDodam)

> **스마트폰과 PC에서 자원봉사 일정을 한눈에 확인하고 참여하는 모바일 퍼스트 자원봉사 일정관리 웹 서비스**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/tikita12/dodamdodam)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tests_33_Pass-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 📱 서비스 주요 화면 구성

- **로그인 & 가입 신청 (`/`)**:
  - **[봉사자 로그인]**: 이름과 비밀번호를 입력하여 1초 만에 봉사 일정 입장
  - **[신규 등록 신청]**: 실명 + 비밀번호(4자리 이상)로 가입 신청 접수 (관리자 승인 대기)
  - **[비밀번호 분실 안내]**: 비밀번호 분실 시 관리자 1초 초기화/재설정 지원
  - **[관리자 로그인]**: 이메일/비밀번호 기반 독립 관리자 대시보드 로그인 분기
- **메인 캘린더 (`/main`)**: 월별 일정 캘린더, 학교명 스마트 3~4자 축약 칩, 추천/신청 가능 일정 목록
- **일정 상세 (`/schedule/:id`)**: 학교/기관 위치 인터랙티브 지도(OpenStreetMap/Leaflet), 실시간 참여자 현황, 0초 즉각 신청/취소
- **내 일정 (`/my-schedules`)**: 내가 신청한 봉사 활동 일정 모아보기 (진행중 / 다가오는 / 지난 일정)
- **관리자 대시보드 (`/admin`)**:
  - 실시간 전체 일정 통합 관리, 참여자 수동 추가/제거
  - 단일 주소 검색 버튼을 통한 학교명·도로명 주소·지도 좌표 1초 자동 완성 등록
  - 일정 수정/취소, 교육과목 CRUD
  - **승인 대기 신청자(🔔) 검토 및 승인/반려 관리**, 등록 봉사자 비밀번호 강제 초기화/재설정

---

## ✨ 핵심 차별화 기능

### 1. 🔐 자원봉사자 가입 신청 & 관리자 승인제 (Approval Workflow)
- 봉사자가 이름과 비밀번호로 가입 신청을 하면 `pending` 상태로 접수됩니다.
- 관리자 화면(`/admin/volunteers`)의 **[가입 승인 대기]** 탭에서 신청 내역을 확인하고 **`[승인]`** 또는 **`[반려]`**를 처리합니다.
- 승인 완료된 봉사자만 이름과 비밀번호로 정상 로그인하여 봉사에 참여할 수 있습니다.
- 상단 헤더의 **로그아웃 아이콘**으로 즉시 첫 화면으로 이동 가능하며, **열쇠(🔑) 버튼**으로 봉사자 본인이 비밀번호를 직접 변경할 수 있습니다.

### 2. ⚡ 초고속 Optimistic UI (낙관적 즉시 처리)
- 봉사 신청, 취소, 봉사자 추가/삭제, 과목 등록 시 네트워크 지연 대기 없이 **0.01초(초고속)**로 화면이 즉시 갱신되며 백그라운드에서 안전하게 동기화됩니다.

### 3. ⏱️ 동일 날짜/시간대 중복 신청 원천 방지 (Conflict Prevention)
- 봉사자가 이미 신청 완료한 다른 일정과 시간이 겹치면(Time Overlap), **중복 신청을 사전에 차단**하고 안내 메시지를 표시합니다.

### 4. 🏫 학교·도로명 주소 & 좌표 원클릭 자동 매칭
- Daum 우편번호 및 자체 부울경/전국 학교 데이터베이스를 연동하여 **`[학교 / 도로명 주소 검색]`** 버튼 하나로 학교명, 도로명 주소, 위도/경도 지도 좌표가 한 번에 완성됩니다.

### 5. 🍏 Safari & 모바일 퍼스트 최적화
- iOS Safari에서 입력창 터치 시 화면이 강제 확대되던 문제(Auto-Zoom)를 표준 폰트 설정으로 원천 차단했습니다.
- `100dvh` 및 `viewport-fit=cover`를 적용하여 노치와 하단 주소창에 가림 없는 완벽한 풀스크린 반응형(`w-full max-w-xl`)을 제공합니다.

### 6. 🛡️ 관리자 & 봉사자 역할 완전 분리 & 보안 규칙 (`firestore.rules`)
- 일반 사용자는 오직 `pending` 상태로만 가입 신청 문서를 생성할 수 있으며, `approved` 승인 및 삭제는 오직 인증된 관리자만 수행 가능합니다.
- 관리자 로그인 시 봉사자 세션과 완전히 격리된 독립 관리자 모드로 동작하며, 상단 헤더에 관리자 배지가 선명하게 표시됩니다.

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend Framework** | Vue 3 (Composition API, `<script setup>`, TypeScript) |
| **Build & Tooling** | Vite 6, Vue Router 4, Pinia |
| **Styling** | Tailwind CSS v4, @lucide/vue Icons |
| **Backend & Cloud** | Firebase Firestore (Realtime), Firebase Authentication, Firebase Hosting |
| **Map & Address** | Daum Postcode SDK, Leaflet, OpenStreetMap |
| **Testing** | Vitest (33개 단위 테스트 100% 통과) |

---

## 🚀 로컬 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 시작 (http://localhost:5173/)
npm run dev

# 3. 단위 테스트 실행 (33 tests pass)
npm test

# 4. 프로덕션 빌드 검증
npm run build
```

---

## 📦 환경변수 설정 (`.env.local`)

프로젝트 루트에 `.env.local` 파일을 생성하여 아래 항목을 설정합니다:

```ini
# Firebase Web 설정
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 관리자 허용 이메일 화이트리스트 (2명 고정 기준)
VITE_ADMIN_EMAILS=cwacc@hanmail.net,admin2@dodam.com
```

---

## 📄 라이선스
Copyright (c) 2026 도담도담 자원봉사단. All rights reserved.
