import axiosClient from "./axiosClient";

export const couponApi = {
  // 관리자: 쿠폰 생성
  createCoupon: async (data) => {
    return await axiosClient.post("/coupons/admin", data);
  },

  // 관리자: 쿠폰 목록 조회
  getCouponsForAdmin: async (params = {}) => {
    return await axiosClient.get("/coupons/admin", { params });
  },

  // 관리자: 쿠폰 비활성화
  deactivateCoupon: async (couponId) => {
    return await axiosClient.patch(`/coupons/admin/${couponId}/deactivate`);
  },

  // 사업자: 내 쿠폰 목록 조회
  getCouponsForOwner: async (params = {}) => {
    return await axiosClient.get("/coupons/owner", { params });
  },
};

export default couponApi;

