// dashboard/route.js

import { Router } from "express";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import {
  getAdminDashboard,
  getOwnerDashboard,
  getAdminRevenueTrend,
  getOwnerRevenueTrend,
} from "./controller.js";

const router = Router();

// 관리자 대시보드 요약
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  getAdminDashboard
);

// 관리자 매출 차트용 추세 데이터
router.get(
  "/admin/revenue-trend",
  verifyToken,
  requireRole("admin"),
  getAdminRevenueTrend
);

router.get(
  "/owner",
  verifyToken,
  requireRole("owner"),
  getOwnerDashboard
);

// 사업자 매출 추세 데이터
router.get(
  "/owner/revenue-trend",
  verifyToken,
  requireRole("owner"),
  getOwnerRevenueTrend
);

export default router;
