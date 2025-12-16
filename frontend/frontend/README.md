# Hotel Booking Management - Admin Frontend

호텔 예약 관리 시스템의 관리자 프론트엔드 애플리케이션입니다.

## 기술 스택

- React 19
- Vite
- React Router DOM
- Axios
- SCSS
- ESLint

## 프로젝트 구조

```
src/
  main.jsx                      # 애플리케이션 진입점
  App.jsx                       # 메인 App 컴포넌트

  router/
    adminRoutes.jsx             # 관리자 라우팅 설정

  api/
    axiosClient.js              # Axios 기본 설정
    adminAuthApi.js             # 인증 API
    adminHotelApi.js            # 호텔 관리 API
    adminBookingApi.js          # 예약 관리 API
    adminUserApi.js             # 회원 관리 API
    adminReviewApi.js           # 리뷰 관리 API
    adminStatsApi.js            # 통계 API

  styles/
    index.scss                  # 글로벌 스타일
    variables.scss              # SCSS 변수
    layout.scss                 # 레이아웃 스타일
    admin.scss                  # 관리자 페이지 스타일
    components.scss             # 컴포넌트 스타일

  components/
    layout/                     # 레이아웃 컴포넌트
    common/                     # 공통 컴포넌트
    admin/                      # 관리자 기능 컴포넌트

  pages/
    auth/                       # 인증 페이지
    admin/                      # 관리자 페이지

  hooks/                        # 커스텀 훅
  context/                      # React Context
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 5. 프리뷰

```bash
npm run preview
```

## 주요 기능

### 관리자 기능

- **대시보드**: 통계 및 최근 활동 확인
- **호텔 관리**: 호텔 등록/수정/삭제/승인
- **예약 관리**: 예약 목록/상세/상태 변경
- **회원 관리**: 사용자/사업자 관리
- **리뷰 관리**: 리뷰 조회/삭제/신고 처리
- **쿠폰 관리**: 쿠폰 생성/수정/삭제
- **설정**: 시스템 설정 및 프로필 관리

## 개발 가이드

### API 연동

모든 API 호출은 `src/api/` 폴더의 모듈을 통해 이루어집니다.

```javascript
import { adminHotelApi } from "./api/adminHotelApi";

// 호텔 목록 조회
const hotels = await adminHotelApi.getHotels({ page: 1 });
```

### 인증

인증은 `AdminAuthContext`를 통해 관리됩니다.

```javascript
import { useAdminAuth } from "./hooks/useAdminAuth";

const { adminInfo, login, logout } = useAdminAuth();
```

### 라우팅

라우팅은 `react-router-dom`을 사용하며, `src/router/adminRoutes.jsx`에서 관리됩니다.

## 라이선스

MIT
