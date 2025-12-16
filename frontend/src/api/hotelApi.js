import axiosClient from "./axiosClient";

export const hotelApi = {
  // 사업자: 내 호텔 목록 조회
  getMyHotels: async (params = {}) => {
    return await axiosClient.get("/hotel/owner", { params });
  },

  // 사업자: 호텔 생성
  createHotel: async (data) => {
    return await axiosClient.post("/hotel/owner", data);
  },

  // 사업자: 호텔 수정
  updateHotel: async (hotelId, data) => {
    return await axiosClient.patch(`/hotel/owner/${hotelId}`, data);
  },

  // 관리자: 전체 호텔 목록 조회 (상태 필터 가능)
  getAllHotels: async (params = {}) => {
    return await axiosClient.get("/hotel/admin", { params });
  },

  // 관리자: 승인 대기 호텔 목록 (하위 호환성)
  getPendingHotels: async (params = {}) => {
    return await axiosClient.get("/hotel/admin/pending", { params });
  },

  // 관리자: 호텔 승인
  approveHotel: async (hotelId) => {
    return await axiosClient.patch(`/hotel/admin/${hotelId}/approve`);
  },

  // 관리자: 호텔 거절
  rejectHotel: async (hotelId) => {
    return await axiosClient.patch(`/hotel/admin/${hotelId}/reject`);
  },
};

export default hotelApi;

