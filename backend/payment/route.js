// payment/route.js
import { Router } from "express";
import {
  createPaymentRecord,
  getPaymentDetail,
} from "./controller.js";
import { verifyToken } from "../common/authmiddleware.js";
import requireRole from "../common/rolemiddleware.js";


const router = Router();

// 선택: 결제 레코드 생성
router.post("/record", verifyToken, createPaymentRecord);

// 결제 상세 조회
router.get("/:paymentKey", verifyToken, getPaymentDetail);

export default router;
