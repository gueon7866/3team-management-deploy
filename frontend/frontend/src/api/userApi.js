import axiosClient from "./axiosClient";

export const userApi = {
  // 내 정보 조회
  getMe: async () => {
    return await axiosClient.get("/user/me");
  },

  // 내 정보 수정
  updateMe: async (data) => {
    return await axiosClient.put("/user/me", data);
  },

  // 비밀번호 변경
  changePassword: async (data) => {
    return await axiosClient.put("/user/me/password", data);
  },

  // 관리자: 회원 목록 조회
  getUsers: async (params = {}) => {
    return await axiosClient.get("/user/admin", { params });
  },

  // 관리자: 회원 정보 수정
  updateUserByAdmin: async (userId, data) => {
    return await axiosClient.put(`/user/admin/${userId}`, data);
  },
};

export default userApi;

