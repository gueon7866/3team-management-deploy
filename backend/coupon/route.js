// ⬇⬇ coupon/route.js 전체를 이걸로 교체 ⬇⬇
import { Router } from "express";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import {
  postCouponAsAdmin,
  getCouponsAsAdmin,
  deactivateCouponAsAdmin,
  getCouponsAsOwner,
} from "./controller.js";

const router = Router();

// ADMIN: 쿠폰 생성
router.post(
  "/admin",
  verifyToken,
  requireRole("admin"),
  postCouponAsAdmin
);

// ADMIN: 쿠폰 목록 조회
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  getCouponsAsAdmin
);

// ADMIN: 쿠폰 비활성화
router.patch(
  "/admin/:id/deactivate",
  verifyToken,
  requireRole("admin"),
  deactivateCouponAsAdmin
);

// OWNER: 내 쿠폰 목록 조회
router.get(
  "/owner",
  verifyToken,
  requireRole("owner"),
  getCouponsAsOwner
);

export default router;
// ⬆⬆ coupon/route.js 전체 교체 끝 ⬆⬆
