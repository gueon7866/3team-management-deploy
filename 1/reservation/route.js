// reservation/route.js
import { Router } from "express";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";

import {
  getReservationsForAdmin,
  getReservationsForOwner,
  patchReservationStatus,
  deleteReservationController,
} from "./controller.js";

const router = Router();

// (여기에 기존 user용 라우트들 있을 것)
// 예: router.post("/", verifyToken, createReservation);

// 🔹 ADMIN: 전체 예약 조회
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  getReservationsForAdmin
);

// 🔹 OWNER: 내 호텔 예약 조회
router.get(
  "/owner",
  verifyToken,
  requireRole("owner"),
  getReservationsForOwner
);

// 🔹 ADMIN / OWNER: 상태 변경
router.patch(
  "/:id/status",
  verifyToken,
  requireRole("owner", "admin"),
  patchReservationStatus
);

// 🔹 ADMIN / OWNER: 예약 삭제
router.delete(
  "/:id",
  verifyToken,
  requireRole("owner", "admin"),
  deleteReservationController
);

export default router;
