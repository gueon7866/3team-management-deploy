// room/route.js
import { Router } from "express";
import {
  getRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom,
} from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";

const router = Router();

//
// OWNER(사업자)용
// /api/room/owner...
//

// 특정 호텔의 객실 목록
// GET /api/room/owner/hotel/:hotelId
router.get(
  "/owner/hotel/:hotelId",
  verifyToken,
  requireRole("owner", "admin"),
  getRoomsByHotel
);

// 객실 생성
// POST /api/room/owner/:hotelId
router.post(
  "/owner/:hotelId",
  verifyToken,
  requireRole("owner", "admin"),
  createRoom
);

// 객실 수정
// PATCH /api/room/owner/:roomId
router.patch(
  "/owner/:roomId",
  verifyToken,
  requireRole("owner", "admin"),
  updateRoom
);

// 원하면 PUT도 같이 지원
router.put(
  "/owner/:roomId",
  verifyToken,
  requireRole("owner", "admin"),
  updateRoom
);

// 객실 삭제
// DELETE /api/room/owner/:roomId
router.delete(
  "/owner/:roomId",
  verifyToken,
  requireRole("owner", "admin"),
  deleteRoom
);

export default router;
