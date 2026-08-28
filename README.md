# 🌱 도담도담 자원봉사 일정관리 시스템 (DodamDodam)

> **스마트폰과 PC에서 자원봉사 일정을 한눈에 확인하고 참여하는 모바일 퍼스트 자원봉사 일정관리 웹 서비스**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/tikita12/dodamdodam)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tests_Pass-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 📱 서비스 미리보기

- **최초 진입 (`/`)**: 15인 정예 자원봉사자 실시간 검색/선택 후 1초 입장 및 관리자 로그인 분기점
- **메인 캘린더 (`/main`)**: 월별 일정 캘린더, 학교명 스마트 3~4자 축약 칩, 추천/신청 가능 일정 목록
- **일정 상세 (`/schedule/:id`)**: 학교/기관 위치 인터랙티브 지도(OpenStreetMap/Leaflet), 실시간 참여자 현황, 0초 즉각 신청/취소
- **내 일정 (`/my-schedules`)**: 내가 신청한 봉사 활동 일정 모아보기 (진행중 / 다가오는 / 지난 일정)
- **관리자 대시보드 (`/admin`)**: 최신순 전체 일정 통합 관리, 참여자 수동 추가/제거, 일정 등록/수정/취소(0초 반영), 교육과목 및 봉사자 명단 CRUD

---

## ✨ 핵심 차별화 기능

### 1. ⚡ 초고속 Optimistic UI (낙관적 즉시 처리)
- 봉사 신청, 취소, 봉사자 추가/삭제, 과목 등록 시 네트워크 지연 대기 없이 **0.01초(초고속)**로 화면이 즉시 갱신되며 백그라운드에서 안전하게 동기화됩니다.

### 2. ⏱️ 동일 날짜/시간대 중복 신청 원천 방지 (Conflict Prevention)
- 봉사자가 이미 신청 완료한 다른 일정과 시간이 겹치면(Time Overlap), **중복 신청을 사전에 차단**하고 안내 메시지를 표시합니다.

### 3. 🛡️ 관리자 & 봉사자 역할 완전 분리
- 관리자 로그인 시 봉사자 세션과 완전히 격리된 독립 관리자 모드로 동작하며, 상단 헤더에 관리자 배지가 선명하게 표시됩니다.
- 관리자 허용 계정: `cwacc@hanmail.net`, `bshine530@gmail.com`, `admin2@dodam.com`

### 4. 🗺️ 무설정 인터랙티브 지도 엔진 (`KakaoMap.vue`)
- 별도 API 키 없이도 OpenStreetMap + Leaflet 엔진으로 실제 도로망, 건물, 마커, 인포윈도우가 즉시 렌더링되며, 카카오맵 길찾기 링크가 함께 제공됩니다.
- 일정 등록 시 경남/창원 학교명을 입력하면 주소와 좌표가 자동으로 입력(Auto-Fill)됩니다.

### 5. 📅 스마트 학교명 축약 & 깔끔한 캘린더 UX
- 좁은 캘린더 칸에서도 글자가 잘리지 않도록 `창원 봉림초등학교` ➔ `봉림초`, `가람유치원` ➔ `가람유` 등으로 3~4자로 자동 축약됩니다.
- 취소된 일정은 지저분한 접두사 없이 은은한 그레이톤(Grayscale)으로 정돈되어 노출됩니다.

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend Framework** | Vue 3 (Composition API, `<script setup>`, TypeScript) |
| **Build & Tooling** | Vite 6, Vue Router 4, Pinia |
| **Styling** | Tailwind CSS v4, Lucide Vue Next Icons |
| **Backend & Cloud** | Firebase Firestore (Realtime), Firebase Authentication |
| **Map Engine** | Leaflet, OpenStreetMap, Kakao Maps JavaScript SDK |
| **Testing** | Vitest (21개 단위 테스트 100% Pass) |

---

## 🚀 로컬 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 시작 (http://localhost:5173/)
npm run dev

# 3. 단위 테스트 실행
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

# 카카오맵 API 키 (선택사항, 미입력 시 Leaflet 인터랙티브 맵 자동 구동)
VITE_KAKAO_MAP_API_KEY=your_kakao_javascript_api_key

# 관리자 허용 이메일 화이트리스트
VITE_ADMIN_EMAILS=cwacc@hanmail.net,bshine530@gmail.com,admin2@dodam.com
```

---

## 📄 라이선스
Copyright (c) 2026 도담도담 자원봉사단. All rights reserved.
