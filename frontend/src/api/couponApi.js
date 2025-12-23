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

  // 관리자: 쿠폰 조회 (단일)
  getCouponById: async (couponId) => {
    return await axiosClient.get(`/coupons/admin/${couponId}`);
  },

  // 관리자: 쿠폰 수정
  updateCoupon: async (couponId, data) => {
    return await axiosClient.put(`/coupons/admin/${couponId}`, data);
  },

  // 관리자: 쿠폰 삭제
  deleteCoupon: async (couponId) => {
    return await axiosClient.delete(`/coupons/admin/${couponId}`);
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

