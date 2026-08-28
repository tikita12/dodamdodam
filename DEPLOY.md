# 🚀 도담도담 자원봉사 일정관리 배포 및 운영 가이드 (DEPLOY.md)

이 문서는 **도담도담 자원봉사 일정관리 웹앱**을 Firebase 및 GitHub에 배포하고 운영하기 위한 실전 가이드입니다.

---

## 📋 1. 사전 준비 사항

### 1-1. Firebase 프로젝트 준비
1. [Firebase Console](https://console.firebase.google.com/) 접속 후 새 프로젝트 생성 (예: `dodamdodam-app`)
2. **Firestore Database** 생성:
   - 위치: `asia-northeast3` (서울) 선택
3. **Authentication (인증)** 활성화:
   - **로그인 제공업체**: `이메일/비밀번호` 사용 설정
   - **사용자 추가**: 운영 관리자 이메일 2명(`cwacc@hanmail.net`, `admin2@dodam.com`) 및 비밀번호 등록
4. **웹 앱 등록**:
   - 프로젝트 설정 > 일반 > 내 앱에서 웹 앱 등록 후 Firebase SDK 설정 키 확인

---

## 🔑 2. 환경변수 설정 (`.env.local`)

프로젝트 루트의 `.env.local` 파일에 실제 발급받은 키를 입력합니다:

```env
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=dodamdodam-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dodamdodam-app
VITE_FIREBASE_STORAGE_BUCKET=dodamdodam-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Admin Allowlist Emails (2명 고정 기준)
VITE_ADMIN_EMAILS=cwacc@hanmail.net,admin2@dodam.com
```

---

## 💻 3. 로컬 개발 및 테스트 실행

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 시작 (http://localhost:5173)
npm run dev

# 3. 단위 테스트 실행 (33개 테스트)
npm test

# 4. 프로덕션 빌드 검증
npm run build
```

---

## 🚢 4. Firebase Hosting & Firestore Rules 배포

### 4-1. Firebase CLI 로그인 및 초기화
```bash
# Firebase CLI 글로벌 설치 (최초 1회)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 연결 확인
firebase use --add
```

### 4-2. Firestore 보안 규칙 배포
```bash
# firestore.rules 파일 배포 (일반 유저 pending 생성 허용 & 관리자 승인/삭제 권한 강제)
firebase deploy --only firestore:rules
```

### 4-3. Hosting 정적 웹앱 빌드 및 배포
```bash
# 1. 프로덕션 정적 파일 빌드 (dist/ 생성)
npm run build

# 2. Firebase Hosting 배포
firebase deploy --only hosting
```

배포가 완료되면 콘솔에 표시되는 **`https://<프로젝트ID>.web.app`** URL로 접속하여 즉시 사용할 수 있습니다.

---

## ⚙️ 5. 운영 워크플로우 가이드

1. **초기 진입 화면 (`/`)**:
   - 등록된 봉사자는 이름과 비밀번호를 입력하여 입장합니다.
   - 신규 봉사자는 **[신규 등록 신청]** 탭에서 실명과 4자리 비밀번호를 입력하여 신청을 접수합니다.
2. **관리자 대시보드 로그인 (`/admin`)**:
   - 진입 화면 하단 **[관리자 대시보드 로그인]** 클릭 후 등록된 관리자 계정으로 로그인합니다.
3. **가입 승인 관리 (`/admin/volunteers`)**:
   - 대시보드 상단 또는 봉사자 관리 페이지의 **[🔔 가입 승인 대기]** 탭에서 신청자를 확인하고 **`[승인]`** 또는 **`[반려]`**를 진행합니다.
   - 봉사자가 비밀번호를 분실한 경우, 각 봉사자 옆 **`[🔑 비번 재설정]`** 버튼을 눌러 새 비밀번호로 1초 만에 초기화해 줄 수 있습니다.
4. **일정 등록 및 주소 자동 완성 (`/admin/schedule/new`)**:
   - **`[학교 / 도로명 주소 검색하기]`** 버튼을 눌러 검색창에서 선택하면 학교명, 도로명 주소, 지도 좌표가 1초 만에 자동 완성됩니다.
