import { Router } from "express";
import {
  getMe,
  updateMe,
  uploadMyProfileImage,
  changePassword,
  getUsers,
  updateUserByAdmin,
} from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";
import { s3ImageUpload } from "../middlewares/s3Upload.js";
import optionalMulter from "../middlewares/optionalMulter.js";


const router = Router();

// 내 정보 (User, Owner, Admin 공통)
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.put(
  "/me/profile-image",
  verifyToken,
  optionalMulter(s3ImageUpload("profile").single("image")),
  uploadMyProfileImage
);
router.put("/me/password", verifyToken, changePassword);

// 관리자 전용
router.get("/admin", verifyToken, requireRole("admin"), getUsers);
router.put("/admin/:userId", verifyToken, requireRole("admin"), updateUserByAdmin);

export default router;