// ⬇⬇ auth/route.js 전체 교체 ⬇⬇
import { Router } from "express";
import { successResponse, errorResponse } from "../common/response.js";
import { login, register } from "./service.js";
import { verifyToken } from "../common/authmiddleware.js";

const router = Router();

/**
 * 기본 로그인 (관리자/사업자 공통)
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(errorResponse("EMAIL_AND_PASSWORD_REQUIRED", 400));
    }

    const { user, token } = await login(email, password);

    return res
      .status(200)
      .json(
        successResponse(
          { user, token },
          "LOGIN_SUCCESS",
          200
        )
      );
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    const status = err.status || err.statusCode || 401;
    return res
      .status(status)
      .json(errorResponse(err.message || "LOGIN_FAIL", status));
  }
});

/**
 * 일반 회원가입 (필요하면 사용)
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json(errorResponse("NAME_EMAIL_PASSWORD_REQUIRED", 400));
    }

    const { user, token } = await register({
      name,
      email,
      password,
      role: role || "user",
    });

    return res
      .status(201)
      .json(
        successResponse(
          { user, token },
          "REGISTER_SUCCESS",
          201
        )
      );
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    const status = err.status || err.statusCode || 400;
    return res
      .status(status)
      .json(errorResponse(err.message || "REGISTER_FAIL", status));
  }
});

/**
 * 🔥 사업자(Owner) 전용 회원가입
 * POST /api/auth/owner/register
 */
router.post("/owner/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      businessNumber,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json(errorResponse("NAME_EMAIL_PASSWORD_REQUIRED", 400));
    }

    // role을 강제로 owner로 고정, 사업자 번호/연락처도 함께 전달
    const { user, token } = await register({
      name,
      email,
      password,
      confirmPassword,
      businessNumber,
      phone,
      role: "owner",
    });

    return res
      .status(201)
      .json(
        successResponse(
          { user, token },
          "OWNER_REGISTER_SUCCESS",
          201
        )
      );
  } catch (err) {
    console.error("OWNER REGISTER ERROR:", err.message);
    const status = err.status || err.statusCode || 400;
    return res
      .status(status)
      .json(errorResponse(err.message || "OWNER_REGISTER_FAIL", status));
  }
});

/**
 * (예시) 내 정보 확인용
 * GET /api/auth/me
 */
router.get("/me", verifyToken, (req, res) => {
  return res
    .status(200)
    .json(
      successResponse(
        { user: req.user },
        "PROFILE_SUCCESS",
        200
      )
    );
});

export default router;
// ⬆⬆ auth/route.js 전체 교체 끝 ⬆⬆
