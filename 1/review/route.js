// ⬇⬇ review/route.js 전체를 이걸로 교체 ⬇⬇
import { Router } from "express";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import {
  getOwnerReportedReviews,
  escalateReview,
  getAdminReportedReviews,
  approveReviewReportController,
  rejectReviewReportController,
} from "./controller.js";

const router = Router();

// OWNER: 유저가 신고한 내 호텔 리뷰 목록
router.get(
  "/owner/reported",
  verifyToken,
  requireRole("owner"),
  getOwnerReportedReviews
);

// OWNER: 리뷰를 어드민에게 신고(이관)
router.patch(
  "/owner/:reviewId/escalate",
  verifyToken,
  requireRole("owner"),
  escalateReview
);

// ADMIN: 오너가 이관한 리뷰 신고 목록
router.get(
  "/admin/reported",
  verifyToken,
  requireRole("admin"),
  getAdminReportedReviews
);

// ADMIN: 신고 승인 (리뷰 삭제)
router.patch(
  "/admin/:reviewId/approve-report",
  verifyToken,
  requireRole("admin"),
  approveReviewReportController
);

// ADMIN: 신고 거부 (리뷰 유지)
router.patch(
  "/admin/:reviewId/reject-report",
  verifyToken,
  requireRole("admin"),
  rejectReviewReportController
);

export default router;
// ⬆⬆ review/route.js 전체 교체 끝 ⬆⬆
