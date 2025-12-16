import axiosClient from "./axiosClient";

export const authApi = {
  // 로그인 (관리자/사업자 공통)
  login: async (credentials) => {
    // axiosClient 인터셉터에서 이미 response.data를 반환하므로
    // response 자체가 백엔드 응답 객체 { success, message, data } 형태
    return await axiosClient.post("/auth/login", credentials);
  },

  // 사업자 회원가입
  ownerRegister: async (data) => {
    return await axiosClient.post("/auth/owner/register", data);
  },

  // 내 정보 조회
  getMe: async () => {
    return await axiosClient.get("/auth/me");
  },
};

export default authApi;

