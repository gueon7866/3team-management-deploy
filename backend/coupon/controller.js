// coupon/controller.js
import { successResponse, errorResponse } from "../common/response.js";
import * as couponService from "./service.js";

// ADMIN: 쿠폰 생성
export const postCouponAsAdmin = async (req, res) => {
  try {
    const adminId = req.user.id || req.user._id;
    const coupon = await couponService.createCoupon(req.body, adminId);

    return res
      .status(201)
      .json(successResponse(coupon, "COUPON_CREATED", 201));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 쿠폰 목록 조회
export const getCouponsAsAdmin = async (req, res) => {
  try {
    const {
      ownerId,
      businessNumber, // 사업자번호로 필터 가능
      isActive,
      page = 1,
      limit = 20,
    } = req.query;

    const data = await couponService.getCouponsForAdmin({
      ownerId,
      businessNumber,
      isActive,
      page,
      limit,
    });

    return res
      .status(200)
      .json(successResponse(data, "COUPON_ADMIN_LIST", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 쿠폰 조회 (단일)
export const getCouponByIdAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(id);

    return res
      .status(200)
      .json(successResponse(coupon, "COUPON_DETAIL", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 404)
      .json(errorResponse(err.message, err.statusCode || 404));
  }
};

// ADMIN: 쿠폰 수정
export const updateCouponAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id || req.user._id;
    const coupon = await couponService.updateCoupon(id, req.body, adminId);

    return res
      .status(200)
      .json(successResponse(coupon, "COUPON_UPDATED", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 쿠폰 삭제
export const deleteCouponAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await couponService.deleteCoupon(id);

    return res
      .status(200)
      .json(successResponse(result, "COUPON_DELETED", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 쿠폰 비활성화
export const deactivateCouponAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponService.deactivateCoupon(id);

    return res
      .status(200)
      .json(successResponse(coupon, "COUPON_DEACTIVATED", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// OWNER: 내 쿠폰 목록 조회
export const getCouponsAsOwner = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const data = await couponService.getCouponsForOwner({
      ownerId,
      page,
      limit,
    });

    return res
      .status(200)
      .json(successResponse(data, "COUPON_OWNER_LIST", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};
