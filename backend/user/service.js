// user/service.js
import User from "./model.js";
import GeneralUser from "./generalUserModel.js";
import bcrypt from "bcryptjs";

// 내 프로필 조회
export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// 내 프로필 수정
export const updateMe = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const fields = ["name", "phone", "profileImage"];
  fields.forEach((f) => {
    if (updates[f] !== undefined) user[f] = updates[f];
  });

  return await user.save();
};

// 비밀번호 변경
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error("INVALID_CURRENT_PASSWORD");
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  return await user.save();
};

// Admin: 유저 목록
export const getUsers = async (options = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const role = options.role;

  // 1) role이 명시된 경우: 해당 타입만 조회
  if (role === "owner" || role === "admin") {
    const filter = { role };
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  if (role === "user") {
    const filter = { role: "user" };
    const [items, total] = await Promise.all([
      GeneralUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      GeneralUser.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 2) role 필터가 없으면: owner/admin + user 모두 합쳐서 정렬 후 페이지네이션
  const [ownerAdmins, generalUsers] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }),
    GeneralUser.find({ role: "user" }).sort({ createdAt: -1 }),
  ]);

  const all = [...ownerAdmins, ...generalUsers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const total = all.length;
  const pagedItems = all.slice(skip, skip + limit);

  return {
    items: pagedItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Admin: 역할 변경 / 블락 토글
export const updateUserByAdmin = async (userId, updates) => {
  // 먼저 User 모델에서 찾기 (owner/admin)
  let user = await User.findById(userId);
  
  // User 모델에 없으면 GeneralUser 모델에서 찾기 (일반 회원)
  if (!user) {
    user = await GeneralUser.findById(userId);
  }
  
  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // isBlocked 필드 업데이트
  if (updates.isBlocked !== undefined) {
    user.isBlocked = updates.isBlocked;
  }
  
  // role 필드 업데이트 (User 모델에만 적용)
  if (updates.role !== undefined && user instanceof User) {
    user.role = updates.role;
  }

  return await user.save();
};
