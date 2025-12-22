// hotel/service.js
import Hotel from "./model.js";
import Room from "../room/model.js"; // ✅ Room 모델 경로가 이거라 가정 (네 레포 구조에 맞춰 필요시 수정)

//
// 공통 유틸: 호텔 목록에 최저 객실가(basePrice/minPrice) 붙이기
//
const attachMinPriceToHotels = async (hotels) => {
  if (!hotels || hotels.length === 0) return hotels;

  const hotelIds = hotels.map((h) => h._id);

  // 호텔별 최저가 집계
  const rows = await Room.aggregate([
    { $match: { hotel: { $in: hotelIds } } },
    { $group: { _id: "$hotel", minPrice: { $min: "$price" } } },
  ]);

  const minMap = new Map(rows.map((r) => [String(r._id), r.minPrice]));

  // mongoose document -> plain object 변환 후 주입
  return hotels.map((h) => {
    const obj = typeof h.toObject === "function" ? h.toObject() : h;
    const minPrice = minMap.get(String(obj._id)) ?? 0;

    // ✅ 유저 프론트가 basePrice를 본다
    obj.minPrice = minPrice;
    obj.basePrice = minPrice;

    return obj;
  });
};

//
// OWNER(사업자) 서비스
//

export const getHotelsByOwner = async (ownerId, options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { owner: ownerId };

  const [items, total] = await Promise.all([
    Hotel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Hotel.countDocuments(filter),
  ]);

  // ✅ 사업자 리스트도 최저가 붙이면 관리 화면에서도 바로 표시 가능
  const enriched = await attachMinPriceToHotels(items);

  return {
    items: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

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
    rating,
    freebies,
    amenities,
  });

  return hotel;
};

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

  if (payload.rating !== undefined) hotel.rating = payload.rating;
  if (payload.freebies !== undefined) hotel.freebies = payload.freebies;
  if (payload.amenities !== undefined) hotel.amenities = payload.amenities;

  if (payload.images !== undefined && Array.isArray(payload.images)) {
    hotel.images = [...(hotel.images || []), ...payload.images];
  }

  return await hotel.save();
};

//
// ADMIN 서비스
//

export const getAllHotels = async (options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
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

  const enriched = await attachMinPriceToHotels(items);

  return {
    items: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

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

  const enriched = await attachMinPriceToHotels(items);

  return {
    items: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};

export const approveHotel = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (hotel.rating < 0) hotel.rating = 0;

  hotel.status = "approved";
  return await hotel.save({ validateBeforeSave: true });
};

export const rejectHotel = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (hotel.rating < 0) hotel.rating = 0;

  hotel.status = "rejected";
  return await hotel.save({ validateBeforeSave: true });
};

//
// ✅ 유저(공개) 서비스: 승인된 호텔 목록
// (이 함수가 네 컨트롤러/라우트에서 쓰이는 이름과 다를 수 있음)
//
export const getApprovedHotels = async (options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { status: "approved" };

  const [items, total] = await Promise.all([
    Hotel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Hotel.countDocuments(filter),
  ]);

  const enriched = await attachMinPriceToHotels(items);

  return {
    items: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
};
