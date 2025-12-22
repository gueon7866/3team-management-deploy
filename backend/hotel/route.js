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
} from "./controller.js";

import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import { s3ImageUpload } from "../middlewares/s3Upload.js";
import optionalMulter from "../middlewares/optionalMulter.js";

const router = express.Router();

// OWNER
router.get(
  "/owner",
  verifyToken,
  requireRole("owner", "admin"),
  getMyHotels
);

router.post(
  "/owner",
  verifyToken,
  requireRole("owner", "admin"),
  optionalMulter(s3ImageUpload("hotel").array("images", 5)),
  createHotel
);

router.patch(
  "/owner/:hotelId",
  verifyToken,
  requireRole("owner", "admin"),
  updateHotel
);

// 호텔 이미지 추가 업로드
// POST /api/hotel/:id/images
router.post(
  "/:id/images",
  verifyToken,
  requireRole("owner", "admin"),
  optionalMulter(s3ImageUpload("hotel").array("images", 5)),
  uploadHotelImages
);

// ADMINt
router.get(
  "/admin",
  verifyToken,
  requireRole("admin"),
  getAllHotels
);

router.get(
  "/admin/pending",
  verifyToken,
  requireRole("admin"),
  getPendingHotels
);

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

export default router;
