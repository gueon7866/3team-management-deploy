import { Router } from "express";
import {
  getMe,
  updateMe,
  changePassword,
  getUsers,
  updateUserByAdmin,
} from "./controller.js";
import { verifyToken, requireRole } from "../common/authmiddleware.js";


const router = Router();

// 내 정보 (User, Owner, Admin 공통)
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.put("/me/password", verifyToken, changePassword);

// 관리자 전용
router.get("/admin", verifyToken, requireRole("admin"), getUsers);
router.put("/admin/:userId", verifyToken, requireRole("admin"), updateUserByAdmin);

export default router;