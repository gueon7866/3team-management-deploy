// auth/service.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../user/model.js";

const JWT_SECRET =
  process.env.JWT_SECRET_KEY ||
  process.env.JWT_SECRET ||
  "dev-secret";

// 🔹 사업자/관리자 회원가입
export const register = async (data) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    businessNumber,
    phone,
    role,
  } = data;

  // 기본 필수값 체크
  if (!name || !email || !password) {
    const err = new Error("NAME_EMAIL_PASSWORD_REQUIRED");
    err.status = 400;
    throw err;
  }

  // 비밀번호 확인
  if (confirmPassword && password !== confirmPassword) {
    const err = new Error("PASSWORD_CONFIRM_MISMATCH");
    err.status = 400;
    throw err;
  }

  const userRole = role || "owner";

  // owner일 때 사업자 번호/핸드폰 필수
  if (userRole === "owner") {
    if (!businessNumber || !phone) {
      const err = new Error("BUSINESS_NUMBER_AND_PHONE_REQUIRED");
      err.status = 400;
      throw err;
    }
  }

  // 중복 이메일 체크
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("USER_ALREADY_EXISTS");
    err.status = 409;
    throw err;
  }

  // 실제 유저 생성 (비밀번호 해시는 user/model.js의 pre('save')에서 처리)
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    businessNumber: userRole === "owner" ? businessNumber : undefined,
    phone,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

// 🔹 로그인
export const login = async (email, password) => {
  if (!email || !password) {
    const err = new Error("EMAIL_AND_PASSWORD_REQUIRED");
    err.status = 400;
    throw err;
  }

  // 이메일로 유저 찾기
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  // 비밀번호 비교
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  // 마지막 로그인 시간 업데이트 (선택)
  user.lastLoginAt = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};
