import axiosClient from "./axiosClient";

export const dashboardApi = {
  // 관리자: 대시보드 데이터
  getAdminDashboard: async () => {
    return await axiosClient.get("/dashboard/admin");
  },

  // 관리자: 매출 추세 데이터 (type: day | month | year)
  getAdminRevenueTrend: async (type = "day") => {
    return await axiosClient.get("/dashboard/admin/revenue-trend", {
      params: { type },
    });
  },

  // 사업자: 대시보드 데이터
  getOwnerDashboard: async () => {
    return await axiosClient.get("/dashboard/owner");
  },

  // 사업자: 매출 추세 데이터 (type: day | month | year)
  getOwnerRevenueTrend: async (type = "day") => {
    return await axiosClient.get("/dashboard/owner/revenue-trend", {
      params: { type },
    });
  },
};

export default dashboardApi;

