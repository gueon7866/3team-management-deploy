// ⬇⬇ coupon/service.js 전체를 이걸로 교체 ⬇⬇
import Coupon from "./model.js";
import User from "../../../1/user/model.js";

// ADMIN: 쿠폰 생성
export const createCoupon = async (data, adminId) => {
  const {
    name,
    code,
    discountAmount,
    minOrderAmount,
    validFrom,
    validTo,
    ownerId,         // (옵션) 예전 방식 호환용
    businessNumber,  // 🔥 새 방식: 사업자번호로 오너 지정
  } = data;

  if (!name || !code || discountAmount == null || !validFrom || !validTo) {
    const err = new Error("COUPON_REQUIRED_FIELDS");
    err.statusCode = 400;
    throw err;
  }

  // ownerId, businessNumber 가 모두 없으면 "전역 쿠폰"으로 간주 (특정 사업자에 귀속되지 않음)
  let owner = null;

  if (ownerId || businessNumber) {
    // 1) owner(사업자) 찾기 – 선택적으로만 수행
    if (ownerId) {
      owner = await User.findById(ownerId);
    } else if (businessNumber) {
      owner = await User.findOne({ businessNumber });
    }

    if (!owner) {
      const err = new Error("OWNER_NOT_FOUND");
      err.statusCode = 404;
      throw err;
    }

    if (owner.role !== "owner") {
      const err = new Error("USER_IS_NOT_OWNER");
      err.statusCode = 400;
      throw err;
    }
  }

  // 2) 코드 중복 체크
  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    const err = new Error("COUPON_CODE_DUPLICATED");
    err.statusCode = 400;
    throw err;
  }

  // 3) 쿠폰 생성
  let coupon;
  try {
    coupon = await Coupon.create({
      name,
      code: code.toUpperCase(),
      discountAmount,
      minOrderAmount: minOrderAmount || 0,
      validFrom,
      validTo,
      owner: owner ? owner._id : null,
      ownerBusinessNumber: owner?.businessNumber || businessNumber || null,
      isActive: true,
      createdBy: adminId,
    });
  } catch (err) {
    console.error("COUPON_CREATE_ERROR", err);
    throw err;
  }

  return coupon;
};

// ADMIN: 쿠폰 목록 조회 (필터 + 페이징)
export const getCouponsForAdmin = async ({
  ownerId,
  businessNumber, // 🔥 추가: 사업자번호로 필터 가능
  isActive,
  page = 1,
  limit = 20,
}) => {
  const filter = {};

  // ownerId / businessNumber 필터는 선택 사항으로 유지 (null 이면 전역 쿠폰 포함 전체)
  if (businessNumber || ownerId) {
    if (businessNumber && !ownerId) {
      const owner = await User.findOne({ businessNumber });
      if (!owner) {
        return {
          items: [],
          total: 0,
          page: Number(page) || 1,
          limit: Number(limit) || 20,
          totalPages: 0,
        };
      }
      filter.owner = owner._id;
    } else if (ownerId) {
      filter.owner = ownerId;
    }
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Coupon.countDocuments(filter);

  const items = await Coupon.find(filter)
    .populate("owner", "name email businessNumber")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return {
    items,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

// ADMIN: 쿠폰 비활성화
export const deactivateCoupon = async (couponId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    const err = new Error("COUPON_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!coupon.isActive) {
    const err = new Error("COUPON_ALREADY_INACTIVE");
    err.statusCode = 400;
    throw err;
  }

  coupon.isActive = false;
  await coupon.save();

  return coupon;
};

// OWNER: 쿠폰 목록 조회 (활성 + 기간 내, 전역/사업자 쿠폰 모두)
export const getCouponsForOwner = async ({
  page = 1,
  limit = 20,
}) => {
  const now = new Date();

  const filter = {
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
  };

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Coupon.countDocuments(filter);

  const items = await Coupon.find(filter)
    .sort({ validTo: 1 }) // 곧 만료될 순서
    .skip(skip)
    .limit(limitNumber);

  return {
    items,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};
// ⬆⬆ coupon/service.js 전체 교체 끝 ⬆⬆
