// dashboard/controller.js

import { successResponse, errorResponse } from "../common/response.js";
import {
  getAdminDashboardSummary,
  getOwnerDashboardSummary,
  getRevenueTrend,
} from "./service.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const data = await getAdminDashboardSummary();

    return res
      .status(200)
      .json(successResponse(data, "ADMIN_DASHBOARD_SUMMARY", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(errorResponse(err.message || "ADMIN_DASHBOARD_FAILED", 500));
  }
};

// 매출 추세 (일/월/년)
export const getAdminRevenueTrend = async (req, res) => {
  try {
    const granularity = req.query.type || "day"; // day | month | year
    const data = await getRevenueTrend(granularity);

    return res
      .status(200)
      .json(successResponse(data, "ADMIN_REVENUE_TREND", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(errorResponse(err.message || "ADMIN_REVENUE_TREND_FAILED", 500));
  }
};

// ⬇⬇ dashboard/controller.js 맨 아래에 이 블럭 통째로 추가 ⬇⬇
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id; // 토큰에서 온 유저 id (owner)

    const data = await getOwnerDashboardSummary(ownerId);

    return res
      .status(200)
      .json(successResponse(data, "OWNER_DASHBOARD_SUMMARY", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(errorResponse(err.message || "OWNER_DASHBOARD_FAILED", 500));
  }
};

// 사업자: 매출 추세 (일/월/년) - 내 호텔 기준
export const getOwnerRevenueTrend = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const granularity = req.query.type || "day";

    // owner 의 호텔 목록 가져와서 호텔 id 배열 전달
    // getOwnerDashboardSummary 와 로직을 맞추기 위해 한 번 더 조회
    const hotels = await (await import("../hotel/model.js")).default.find({
      owner: ownerId,
    }).select("_id");
    const hotelIds = hotels.map((h) => h._id);

    const data = await getRevenueTrend(granularity, hotelIds);

    return res
      .status(200)
      .json(successResponse(data, "OWNER_REVENUE_TREND", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(errorResponse(err.message || "OWNER_REVENUE_TREND_FAILED", 500));
  }
};
// ⬆⬆ dashboard/controller.js 여기에까지 추가 ⬆⬆
