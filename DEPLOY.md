# 🚀 도담도담 자원봉사 일정관리 배포 및 운영 가이드 (DEPLOY.md)

이 문서는 **도담도담 자원봉사 일정관리 웹앱**을 Firebase 및 카카오맵에 배포하고 운영하기 위한 실전 가이드입니다.

---

## 📋 1. 사전 준비 사항

### 1-1. Firebase 프로젝트 준비
1. [Firebase Console](https://console.firebase.google.com/) 접속 후 새 프로젝트 생성 (예: `dodamdodam-app`)
2. **Firestore Database** 생성:
   - 위치: `asia-northeast3` (서울) 선택
3. **Authentication (인증)** 활성화:
   - **로그인 제공업체**: `이메일/비밀번호` 사용 설정
   - **사용자 추가**: 운영 관리자 이메일(`bshine530@gmail.com`) 및 비밀번호 등록
4. **웹 앱 등록**:
   - 프로젝트 설정 > 일반 > 내 앱에서 웹 앱 등록 후 Firebase SDK 설정 키 확인

### 1-2. 카카오 디벨로퍼스 JavaScript API 키 준비
1. [카카오 디벨로퍼스](https://developers.kakao.com/) 로그인 후 내 애플리케이션 추가
2. **앱 키 > JavaScript 키** 복사
3. **플랫폼 > Web 플랫폼 등록**:
   - `http://localhost:5173` (로컬 개발용)
   - `https://<당신의-프로젝트-ID>.web.app` (Firebase Hosting 배포용)
   - `https://<당신의-프로젝트-ID>.firebaseapp.com`

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

# Kakao Map JavaScript API Key
VITE_KAKAO_MAP_API_KEY=your_kakao_javascript_api_key_here

# Admin Allowlist Emails (쉼표로 구분)
VITE_ADMIN_EMAILS=bshine530@gmail.com,admin2@dodam.com
```

---

## 💻 3. 로컬 개발 및 테스트 실행

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 시작 (http://localhost:5173)
npm run dev

# 3. 단위 테스트 실행 (Vitest 20개 테스트)
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
# (Firebase 콘솔에서 생성한 프로젝트 선택)
```

### 4-2. Firestore 보안 규칙 배포
```bash
# firestore.rules 파일 배포
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

## ⚙️ 5. 초기 운영 데이터 셋업 순서

1. **배포 URL 접속** (`https://<프로젝트ID>.web.app`)
2. 진입 화면 하단의 **[관리자 로그인]** 클릭 ➔ `bshine530@gmail.com` 및 비밀번호로 로그인
3. 관리자 대시보드에서:
   - **[👥 봉사자 관리]**: 15명의 자원봉사자 이름 등록 (예: 홍길동, 김철수 등)
   - **[📚 교육과목 관리]**: 기본 교육 과목 등록 (예: 청소년 도박예방 교육, 금융생활 교육 등)
   - **[+ 새 일정]**: 장소명 검색을 통해 새 봉사 일정 등록
4. 봉사자들은 로그인 없이 진입 화면에서 본인 이름만 선택하여 즉시 일정을 조회하고 1-Click 참여 신청이 가능합니다.
