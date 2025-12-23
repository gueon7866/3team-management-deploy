import axios from "axios";

// 개발 환경에서는 항상 상대 경로(/api)를 사용하여 Vite 프록시 활용
// 프로덕션 환경에서만 환경 변수 사용
const getBaseURL = () => {
  // 개발 환경 (Vite dev server)
  if (import.meta.env.DEV) {
    return "/api";
  }
  
  // 프로덕션 환경
  return import.meta.env.VITE_API_BASE_URL || "/api";
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData인 경우 Content-Type을 자동 설정하도록 (axios가 자동으로 설정)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
  (response) => {
    // 백엔드 응답 구조: { success: true, message: "...", data: {...} }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      const currentPath = window.location.pathname;
      // 로그인 페이지나 회원가입 페이지가 아닐 때만 리다이렉트
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register") &&
        (currentPath.startsWith("/admin") || currentPath.startsWith("/owner"))
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
