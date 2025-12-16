import axiosClient from "./axiosClient";

// 관리자 예약 관리 API
export const adminBookingApi = {
  // 예약 목록 조회 (필터/페이지네이션)
  getBookings: async (params = {}) => {
    const query = { ...params };
    // 빈 문자열은 쿼리에서 제거해 백엔드 필터를 깔끔하게 유지
    Object.keys(query).forEach((key) => {
      if (query[key] === "" || query[key] === undefined || query[key] === null) {
        delete query[key];
      }
    });

    // axiosClient가 success 응답 객체를 반환하므로 data 안의 실제 payload만 넘긴다
    const response = await axiosClient.get("/reservation/admin", { params: query });
    return response.data;
  },

  // 상태 변경 (확정/취소/완료 등)
  updateBookingStatus: async (reservationId, status) => {
    const response = await axiosClient.patch(`/reservation/${reservationId}/status`, {
      status,
    });
    return response.data;
  },

  // 취소 헬퍼
  cancelBooking: async (reservationId) => {
    return adminBookingApi.updateBookingStatus(reservationId, "cancelled");
  },
};

export default adminBookingApi;

