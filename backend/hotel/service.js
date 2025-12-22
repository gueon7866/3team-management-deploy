// hotel/service.js
import Hotel from "./model.js";

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

  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;

  const hotel = await Hotel.create({
    name,
    city,
    address,
    owner: ownerId,
    images,
    status: "pending",
    rating: safeRating < 0 ? 0 : safeRating,
    freebies: Array.isArray(freebies) ? freebies : [],
    amenities: Array.isArray(amenities) ? amenities : [],
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

  if (payload.rating !== undefined) {
    const n = Number(payload.rating);
    hotel.rating = Number.isFinite(n) ? (n < 0 ? 0 : n) : hotel.rating;
  }
  if (payload.freebies !== undefined) hotel.freebies = payload.freebies;
  if (payload.amenities !== undefined) hotel.amenities = payload.amenities;

  // images는 전달된 배열을 "추가"하는 방식 유지
  if (payload.images !== undefined && Array.isArray(payload.images)) {
    hotel.images = [...(hotel.images || []), ...payload.images];
  }

  const updated = await hotel.save();
  return updated;
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

export const approveHotel = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (hotel.rating < 0) hotel.rating = 0;

  hotel.status = "approved";
  const updated = await hotel.save({ validateBeforeSave: true });
  return updated;
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
  const updated = await hotel.save({ validateBeforeSave: true });
  return updated;
};

// ✅ 프론트가 호출하는 /api/hotel/admin/:hotelId 대응용 단건 조회
// - admin: 아무 호텔이나 조회 가능
// - owner: 본인 호텔만 조회 가능
export const getHotelById = async (hotelId, ownerId = null) => {
  const hotel = await Hotel.findById(hotelId).populate(
    "owner",
    "name email businessNumber"
  );

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (ownerId) {
    const realOwnerId =
      hotel.owner?._id?.toString?.() || hotel.owner?.toString?.();
    if (realOwnerId && realOwnerId !== ownerId.toString()) {
      const err = new Error("NO_PERMISSION");
      err.statusCode = 403;
      throw err;
    }
  }

  return hotel;
};
