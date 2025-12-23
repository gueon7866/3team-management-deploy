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

  // ownerId가 null이면 관리자로 간주하여 권한 체크 건너뛰기
  if (ownerId !== null && hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  // 디버깅: 업데이트 전 데이터
  console.log("🔧 updateHotel - Before update:", {
    hotelId,
    currentName: hotel.name,
    currentCity: hotel.city,
    payloadName: payload.name,
    payloadCity: payload.city,
    payloadFreebies: payload.freebies,
    payloadAmenities: payload.amenities,
    payloadImages: payload.images,
  });

  if (payload.name !== undefined) hotel.name = payload.name;
  if (payload.city !== undefined) hotel.city = payload.city;
  if (payload.address !== undefined) hotel.address = payload.address;

  if (payload.rating !== undefined) hotel.rating = payload.rating;
  if (payload.freebies !== undefined) hotel.freebies = payload.freebies;
  if (payload.amenities !== undefined) hotel.amenities = payload.amenities;

  // 이미지 교체 (추가가 아닌 완전 교체)
  if (payload.images !== undefined && Array.isArray(payload.images)) {
    hotel.images = payload.images;
  }

  const savedHotel = await hotel.save();
  
  // 디버깅: 업데이트 후 데이터
  console.log("✅ updateHotel - After update:", {
    hotelId,
    savedName: savedHotel.name,
    savedCity: savedHotel.city,
    savedFreebies: savedHotel.freebies,
    savedAmenities: savedHotel.amenities,
    savedImages: savedHotel.images,
  });

  return savedHotel;
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

// 공개 API: 호텔 목록 조회 (도시, 인원 필터링 지원)
export const listHotels = async ({ city, guests }) => {
  const query = { status: "approved" };
  if (city) {
    // 정규식을 사용해 부분 매칭 지원
    const regex = new RegExp(city, "i");
    query.city = regex;
  }

  if (guests) {
    const rooms = await Room.find({
      capacity: { $gte: Number(guests) },
      status: "active",
    }).distinct("hotel");
    query._id = { $in: rooms };
  }

  const hotels = await Hotel.find(query).sort({ createdAt: -1 });
  if (!hotels.length) return [];

  // 최소 객실 가격 계산
  const enriched = await attachMinPriceToHotels(hotels);
  return enriched;
};

// 호텔 상세 조회 (공개/인증 모두 사용)
export const getHotelDetail = async (id, { checkIn, checkOut, userId } = {}) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // 객실 목록은 roomService에서 가져옴
  const roomService = await import("../room/service.js");
  const rooms = await roomService.getRoomsByHotel(null, id, "admin"); // 관리자 권한으로 조회

  // 리뷰는 reviewService에서 가져옴
  const reviewModel = await import("../review/model.js");
  const reviews = await reviewModel.Review.find({ hotelId: id })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  // 찜하기 여부는 favoriteService에서 가져옴
  let isFavorite = false;
  if (userId) {
    const favoriteModel = await import("../favorite/model.js");
    const fav = await favoriteModel.Favorite.findOne({ userId, hotelId: id }).select("_id");
    isFavorite = !!fav;
  }

  // 최소 객실 가격 추가
  const enriched = await attachMinPriceToHotels([hotel]);
  const hotelWithPrice = enriched[0] || hotel.toObject();

  return { hotel: hotelWithPrice, rooms, reviews, isFavorite };
};

// 호텔별 객실 목록 조회
export const listRoomsByHotel = async (id, { checkIn, checkOut } = {}) => {
  const { getRoomsByHotel } = await import("../room/service.js");
  return getRoomsByHotel(null, id, "admin");
};

// 호텔 단일 조회 (관리자/사업자용)
export const getHotelById = async (hotelId, ownerId = null) => {
  if (!hotelId) {
    const err = new Error("HOTEL_ID_REQUIRED");
    err.statusCode = 400;
    throw err;
  }

  const hotel = await Hotel.findById(hotelId)
    .populate("owner", "name email businessNumber");

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // 사업자가 자신의 호텔만 조회할 수 있도록 권한 체크
  if (ownerId) {
    // owner가 populate된 경우와 아닌 경우 모두 처리
    const hotelOwnerId = hotel.owner?._id?.toString() || hotel.owner?.toString() || hotel.owner?.id?.toString();
    const requestOwnerId = ownerId.toString();
    
    if (hotelOwnerId && hotelOwnerId !== requestOwnerId) {
      const err = new Error("NO_PERMISSION");
      err.statusCode = 403;
      throw err;
    }
  }

  // 최소 객실 가격 추가
  const enriched = await attachMinPriceToHotels([hotel]);
  return enriched[0] || hotel.toObject();
};
