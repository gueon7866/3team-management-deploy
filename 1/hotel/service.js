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
    Hotel.find(filter)
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

// 호텔 생성
export const createHotel = async (ownerId, payload) => {
  const { name, city, address } = payload;

  if (!name || !city) {
    const err = new Error("HOTEL_REQUIRED_FIELDS");
    err.statusCode = 400;
    throw err;
  }

  const hotel = await Hotel.create({
    owner: ownerId,
    name,
    city,
    address,
    status: "pending", // 생성 시 기본은 pending
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

  hotel.status = "approved";
  const updated = await hotel.save();
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

  hotel.status = "rejected";
  const updated = await hotel.save();
  return updated;
};
