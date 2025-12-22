// hotel/service.js
import Hotel from "./model.js";

//
// OWNER(사업자) 서비스
//

// 내 호텔 목록 (페이징)
export const getHotelsByOwner = async (ownerId, options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { owner: ownerId };

  const [items, total] = await Promise.all([
    Hotel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Hotel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

// 호텔 생성
export const createHotel = async (ownerId, data) => {
  const {
    name,
    city,
    address,
    images = [],
    rating = 0,
    freebies = [],
    amenities = [],
  } = data;

  if (!name || !city) {
    const err = new Error("HOTEL_REQUIRED_FIELDS");
    err.statusCode = 400;
    throw err;
  }

  const hotel = await Hotel.create({
    name,
    city,
    address,
    owner: ownerId,
    images,
    status: "pending",

    // ✅ 추가 저장
    rating,
    freebies,
    amenities,
  });

  return hotel;
};

// 호텔 수정
export const updateHotel = async (ownerId, hotelId, payload) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  if (payload.name !== undefined) hotel.name = payload.name;
  if (payload.city !== undefined) hotel.city = payload.city;
  if (payload.address !== undefined) hotel.address = payload.address;

  // ✅ 추가 업데이트
  if (payload.rating !== undefined) hotel.rating = payload.rating;
  if (payload.freebies !== undefined) hotel.freebies = payload.freebies;
  if (payload.amenities !== undefined) hotel.amenities = payload.amenities;

  // 이미지 업데이트 (새 이미지가 있으면 기존 이미지에 추가)
  if (payload.images !== undefined) {
    if (Array.isArray(payload.images)) {
      // 새로운 이미지만 전달된 경우 기존 이미지에 추가
      hotel.images = [...(hotel.images || []), ...payload.images];
    }
  }

  const updated = await hotel.save();
  return updated;
};

//
// ADMIN 서비스
//

// 전체 호텔 목록 조회 (상태 필터 가능)
export const getAllHotels = async (options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // 상태 필터가 있으면 적용
  if (options.status && options.status !== "all") {
    filter.status = options.status;
  }

  const [items, total] = await Promise.all([
    Hotel.find(filter)
      .populate("owner", "name email businessNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Hotel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

// 승인 대기 호텔 목록
export const getPendingHotels = async (options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: "pending" };

  const [items, total] = await Promise.all([
    Hotel.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Hotel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

// 호텔 승인
export const approveHotel = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // rating이 0보다 작으면 0으로 설정 (평점 없음)
  if (hotel.rating < 0) {
    hotel.rating = 0;
  }

  hotel.status = "approved";
  // validateBeforeSave: false 옵션으로 validation 오류 방지
  const updated = await hotel.save({ validateBeforeSave: true });
  return updated;
};

// 호텔 반려
export const rejectHotel = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // rating이 0보다 작으면 0으로 설정 (평점 없음)
  if (hotel.rating < 0) {
    hotel.rating = 0;
  }

  hotel.status = "rejected";
  // validateBeforeSave: true 옵션으로 validation 실행
  const updated = await hotel.save({ validateBeforeSave: true });
  return updated;
};

// 관리자: 호텔 단일 조회
export const getHotelById = async (hotelId, ownerId = null) => {
  const hotel = await Hotel.findById(hotelId).populate("owner", "name email businessNumber");

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // owner인 경우 본인 호텔만 조회 가능
  if (ownerId && hotel.owner && hotel.owner._id.toString() !== ownerId.toString() && hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  return hotel;
};
