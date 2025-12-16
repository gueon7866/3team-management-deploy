// hotel/route.js
import { Router } from "express";
import {
  getMyHotels,
  createHotel,
  updateHotel,
  getAllHotels,
  getPendingHotels,
  approveHotel,
  rejectHotel,
} from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";

const router = Router();

//
// OWNER(사업자)용
// /api/hotel/owner...
//

// 내 호텔 목록 조회
router.get(
  "/owner",
  verifyToken,
  requireRole("owner", "admin"),
  getMyHotels
);

// 호텔 생성
router.post(
  "/owner",
  verifyToken,
  requireRole("owner", "admin"),
  createHotel
);

// 호텔 수정 (PATCH / PUT 둘 다 같은 핸들러)
router.patch(
  "/owner/:hotelId",
  verifyToken,
  requireRole("owner", "admin"),
  updateHotel
);

router.put(
  "/owner/:hotelId",
  verifyToken,
  requireRole("owner", "admin"),
  updateHotel
);

//
// ADMIN용
// /api/hotel/admin...
//

// 전체 호텔 목록 조회 (상태 필터 가능)
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  getAllHotels
);

// 승인 대기 호텔 목록 (하위 호환성)
router.get(
  "/admin/pending",
  verifyToken,
  requireRole("admin"),
  getPendingHotels
);

// 호텔 승인
router.patch(
  "/admin/:hotelId/approve",
  verifyToken,
  requireRole("admin"),
  approveHotel
);

// 호텔 반려
router.patch(
  "/admin/:hotelId/reject",
  verifyToken,
  requireRole("admin"),
  rejectHotel
);

export default router;
