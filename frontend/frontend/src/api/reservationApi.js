import axiosClient from "./axiosClient";

export const reservationApi = {
  // 관리자: 전체 예약 조회
  getReservationsForAdmin: async (params = {}) => {
    return await axiosClient.get("/reservation/admin", { params });
  },

  // 사업자: 내 호텔 예약 조회
  getReservationsForOwner: async (params = {}) => {
    return await axiosClient.get("/reservation/owner", { params });
  },

  // 예약 상태 변경
  updateReservationStatus: async (reservationId, status) => {
    return await axiosClient.patch(`/reservation/${reservationId}/status`, { status });
  },

  // 예약 삭제
  deleteReservation: async (reservationId) => {
    return await axiosClient.delete(`/reservation/${reservationId}`);
  },
};

export default reservationApi;

