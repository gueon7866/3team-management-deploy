import axiosClient from "./axiosClient";

export const reviewApi = {
  // 사업자: 내 호텔의 모든 리뷰 목록
  getOwnerReviews: async (params = {}) => {
    return await axiosClient.get("/reviews/owner", { params });
  },

  // 사업자: 유저가 신고한 내 호텔 리뷰 목록
  getOwnerReportedReviews: async (params = {}) => {
    return await axiosClient.get("/reviews/owner/reported", { params });
  },

  // 사업자: 리뷰를 관리자에게 신고(이관)
  escalateReview: async (reviewId, reason) => {
    return await axiosClient.patch(`/reviews/owner/${reviewId}/escalate`, { reason });
  },

  // 관리자: 사업자가 이관한 리뷰 신고 목록
  getAdminReportedReviews: async (params = {}) => {
    return await axiosClient.get("/reviews/admin/reported", { params });
  },

  // 관리자: 신고 승인 (리뷰 삭제)
  approveReviewReport: async (reviewId) => {
    return await axiosClient.patch(`/reviews/admin/${reviewId}/approve-report`);
  },

  // 관리자: 신고 거부 (리뷰 유지)
  rejectReviewReport: async (reviewId) => {
    return await axiosClient.patch(`/reviews/admin/${reviewId}/reject-report`);
  },
};

export default reviewApi;

