// user/controller.js
import * as userService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// GET /api/user/me
export const getMe = async (req, res) => {
  try {
    const user = await userService.getMe(req.user.id || req.user._id);
    return res.status(200).json(successResponse(user, "ME", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 404)
      .json(errorResponse(err.message, err.statusCode || 404));
  }
};

// PUT /api/user/me
export const updateMe = async (req, res) => {
  try {
    const user = await userService.updateMe(req.user.id || req.user._id, req.body);
    return res.status(200).json(successResponse(user, "ME_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// PUT /api/user/me/profile-image
export const uploadMyProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse("NO_IMAGE_UPLOADED", 400));
    }
    const user = await userService.updateMe(req.user.id || req.user._id, {
      profileImage: req.file.location,
    });
    return res.status(200).json(successResponse(user, "PROFILE_IMAGE_UPDATED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// PUT /api/user/me/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userService.changePassword(
      req.user.id || req.user._id,
      currentPassword,
      newPassword
    );
    return res
      .status(200)
      .json(successResponse(user, "PASSWORD_CHANGED", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// Admin: GET /api/user/admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 20, 10);
    const role = req.query.role;

    const data = await userService.getUsers({ page, limit, role });

    // 응답 구조를 프론트엔드가 기대하는 형식으로 맞춤
    return res.status(200).json(successResponse({
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
      totalPages: data.totalPages || 0,
    }, "USER_LIST", 200));
  } catch (err) {
    return res
      .status(400)
      .json(errorResponse(err.message, 400));
  }
};

// Admin: PUT /api/user/admin/:userId
export const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    console.log("🔧 updateUserByAdmin 호출:", {
      userId,
      updates,
      user: req.user?.id || req.user?._id,
      role: req.user?.role,
    });

    if (!userId) {
      return res.status(400).json(errorResponse("USER_ID_REQUIRED", 400));
    }

    const user = await userService.updateUserByAdmin(userId, updates);

    console.log("✅ updateUserByAdmin 성공:", {
      userId,
      isBlocked: user.isBlocked,
      role: user.role,
    });

    return res.status(200).json(successResponse(user, "USER_UPDATED", 200));
  } catch (err) {
    console.error("❌ updateUserByAdmin 실패:", {
      userId: req.params.userId,
      error: err.message,
      statusCode: err.statusCode,
    });
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};
