// room/service.js
import Room from "./model.js";
import Hotel from "../hotel/model.js";

//
// Owner(사업자) 서비스
//

// 특정 호텔의 객실 목록
export const getRoomsByHotel = async (ownerId, hotelId, userRole = null) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  // 관리자인 경우 권한 체크를 건너뜀
  if (userRole !== "admin") {
    // owner 필드가 비어 있으면 현재 오너로 보정
    if (!hotel.owner) {
      hotel.owner = ownerId;
      await hotel.save();
    } else if (hotel.owner.toString() !== ownerId.toString()) {
      const err = new Error("NO_PERMISSION");
      err.statusCode = 403;
      throw err;
    }
  }

  const rooms = await Room.find({ hotel: hotelId }).sort({ createdAt: -1 });
  return rooms;
};

// 객실 생성
export const createRoom = async (ownerId, hotelId, data) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!hotel.owner) {
    // owner 정보가 비어 있으면 현재 오너로 보정
    hotel.owner = ownerId;
    await hotel.save();
  } else if (hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  const { name, type, price, capacity, inventory } = data;

  if (!name || !type || price == null || capacity == null || inventory == null) {
    const err = new Error("ROOM_REQUIRED_FIELDS");
    err.statusCode = 400;
    throw err;
  }

  const room = await Room.create({
    hotel: hotelId,
    name,
    type,
    price,
    capacity,
    inventory,
    images: Array.isArray(data.images) ? data.images : [],
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    status: data.status || "active",
  });

  return room;
};

// 객실 수정
export const updateRoom = async (ownerId, roomId, updates) => {
  const room = await Room.findById(roomId);

  if (!room) {
    const err = new Error("ROOM_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const hotel = await Hotel.findById(room.hotel);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!hotel.owner) {
    hotel.owner = ownerId;
    await hotel.save();
  } else if (hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  const fields = [
    "name",
    "type",
    "price",
    "capacity",
    "inventory",
    "images",
    "amenities",
    "status",
  ];

  fields.forEach((f) => {
    if (updates[f] !== undefined) {
      room[f] = updates[f];
    }
  });

  const updated = await room.save();
  return updated;
};

// 객실 삭제
export const deleteRoom = async (ownerId, roomId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    const err = new Error("ROOM_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const hotel = await Hotel.findById(room.hotel);

  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!hotel.owner) {
    hotel.owner = ownerId;
    await hotel.save();
  } else if (hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  await Room.findByIdAndDelete(roomId);
  return true;
};

// 객실 이미지 추가
export const addRoomImages = async (ownerId, roomId, imageUrls = []) => {
  const room = await Room.findById(roomId);
  if (!room) {
    const err = new Error("ROOM_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const hotel = await Hotel.findById(room.hotel);
  if (!hotel) {
    const err = new Error("HOTEL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (!hotel.owner) {
    hotel.owner = ownerId;
    await hotel.save();
  } else if (hotel.owner.toString() !== ownerId.toString()) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  room.images = [...(room.images || []), ...imageUrls];
  return await room.save();
};
