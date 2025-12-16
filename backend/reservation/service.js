// reservation/service.js
import Reservation from "./model.js";
import Hotel from "../hotel/model.js";

// 🔹 ADMIN: 전체 예약 조회 (옵션 status 필터)
// ⬇⬇ reservation/service.js 안의 getAdminReservations 전체를 이걸로 교체 ⬇⬇
export const getAdminReservations = async ({
  status,
  hotelId,
  startDate,
  endDate,
  page = 1,
  limit = 20,
}) => {
  const filter = {};

  // 상태 필터
  if (status) {
    filter.status = status;
  }

  // 특정 호텔 필터
  if (hotelId) {
    filter.hotelId = hotelId;
  }

  // 날짜 필터 (createdAt 기준)
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Reservation.countDocuments(filter);

  const reservations = await Reservation.find(filter)
    .populate("userId", "name email")
    .populate("hotelId", "name city")
    .populate("roomId", "roomNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return {
    items: reservations,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};
// ⬆⬆ getAdminReservations 교체 끝 ⬆⬆


// 🔹 OWNER: 내 호텔들에 대한 예약만 조회
// ⬇⬇ reservation/service.js 안의 getOwnerReservations 전체를 이걸로 교체 ⬇⬇
export const getOwnerReservations = async ({
  ownerId,
  status,
  startDate,
  endDate,
  page = 1,
  limit = 20,
}) => {
  // 1️⃣ 이 오너가 가진 호텔들 찾기
  const hotels = await Hotel.find({ owner: ownerId }).select("_id");
  const hotelIds = hotels.map((h) => h._id);

  if (hotelIds.length === 0) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;

    return {
      items: [],
      total: 0,
      page: pageNumber,
      limit: limitNumber,
      totalPages: 0,
    };
  }

  // 2️⃣ 그 호텔들에 대한 예약만 조회
  const filter = { hotelId: { $in: hotelIds } };

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Reservation.countDocuments(filter);

  const reservations = await Reservation.find(filter)
    .populate("userId", "name email")
    .populate("hotelId", "name city")
    .populate("roomId", "roomNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return {
    items: reservations,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};
// ⬆⬆ getOwnerReservations 교체 끝 ⬆⬆


// 🔹 ADMIN / OWNER: 예약 상태 변경
export const updateReservationStatus = async ({ reservationId, status }) => {
  const allowedStatus = ["pending", "confirmed", "cancelled", "completed"];
  if (!allowedStatus.includes(status)) {
    throw new Error("허용되지 않은 상태값입니다.");
  }

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new Error("예약을 찾을 수 없습니다.");
  }

  reservation.status = status;
  await reservation.save();

  return reservation;
};

// 🔹 ADMIN / OWNER: 예약 삭제
export const deleteReservation = async (reservationId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    const err = new Error("RESERVATION_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  await Reservation.findByIdAndDelete(reservationId);
  return true;
};