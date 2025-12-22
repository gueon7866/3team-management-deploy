import jwt from "jsonwebtoken";
import { errorResponse } from "./response.js";
import { User } from "../user/model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(errorResponse("NO_TOKEN_PROVIDED", 401));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json(errorResponse("INVALID_TOKEN_FORMAT", 401));
    }

    // Use the common secret key
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "dev-secret";
    const decoded = jwt.verify(token, secret);

    // 필요한 최소 사용자 정보 로드 (password 제외)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json(errorResponse("USER_NOT_FOUND", 401));
    }

    // user 객체를 plain JavaScript 객체로 변환
    // toJSON()을 사용하면 model의 transform이 적용되어 id가 자동으로 설정됨
    const userObj = user.toJSON ? user.toJSON() : user.toObject ? user.toObject() : user;
    
    // user 객체 전체를 req.user에 할당
    req.user = userObj;
    
    // _id를 id로도 접근 가능하도록 설정 (안전장치)
    if (req.user._id && !req.user.id) {
      req.user.id = String(req.user._id);
    }
    // role이 문자열인지 확인
    if (req.user.role) {
      req.user.role = String(req.user.role);
    }
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res
      .status(401)
      .json(errorResponse("INVALID_OR_EXPIRED_TOKEN", 401));
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse("FORBIDDEN", 403));
    }
    next();
  };
};
