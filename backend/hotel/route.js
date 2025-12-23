// hotel/route.js
import express from "express";
import {
  getMyHotels,
  createHotel,
  updateHotel,
  getAllHotels,
  getPendingHotels,
  approveHotel,
  rejectHotel,
  uploadHotelImages,
  getHotelById,
} from "./controller.js";

import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import { s3ImageUpload } from "../middlewares/s3Upload.js";
import optionalMulter from "../middlewares/optionalMulter.js";

const router = express.Router();

// OWNER
router.get("/owner", verifyToken, requireRole("owner"), getMyHotels);

// 호텔 생성(이미지 optional)
router.post(
  "/owner",
  verifyToken,
  requireRole("owner"),
  optionalMulter(s3ImageUpload("hotel").array("images", 10)),
  createHotel
);

router.patch(
  "/owner/:hotelId",
  verifyToken,
  requireRole("owner", "admin"),
  optionalMulter(s3ImageUpload("hotel").array("images", 10)),
  updateHotel
);

// ADMIN 리스트/대기
router.get("/admin", verifyToken, requireRole("admin"), getAllHotels);
router.get("/admin/pending", verifyToken, requireRole("admin"), getPendingHotels);

// ✅ 프론트가 owner 화면에서도 이 엔드포인트를 호출함 → owner도 허용
router.get(
  "/admin/:hotelId",
  verifyToken,
  requireRole("admin", "owner"),
  getHotelById
);

// 승인/거절
router.patch(
  "/admin/:hotelId/approve",
  verifyToken,
  requireRole("admin"),
  approveHotel
);
router.patch(
  "/admin/:hotelId/reject",
  verifyToken,
  requireRole("admin"),
  rejectHotel
);

// 이미지 업로드
router.post(
  "/:id/images",
  verifyToken,
  requireRole("owner", "admin"),
  s3ImageUpload("hotel").array("images", 10),
  uploadHotelImages
);

export default router;
