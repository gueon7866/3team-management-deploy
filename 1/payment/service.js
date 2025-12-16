// payment/service.js
import Payment from "./model.js";
import Reservation from "../reservation/model.js";

// 결제 레코드 생성 (예약 생성 시 pending 상태로 만들 수도 있고, Toss confirm 이후 생성도 가능)
export const createPaymentRecord = async (userId, reservationId, payload) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    const err = new Error("RESERVATION_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  if (reservation.user.toString() !== userId) {
    const err = new Error("NO_PERMISSION");
    err.statusCode = 403;
    throw err;
  }

  const payment = await Payment.create({
    user: userId,
    reservation: reservationId,
    paymentKey: payload.paymentKey,
    orderId: payload.orderId,
    amount: payload.amount,
    status: "pending",
    rawResponse: payload.rawResponse || null,
  });

  return payment;
};

// 결제 상태 업데이트
export const updatePaymentStatus = async (paymentKey, status, rawResponse) => {
  const payment = await Payment.findOne({ paymentKey });
  if (!payment) {
    const err = new Error("PAYMENT_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  payment.status = status;
  if (rawResponse) payment.rawResponse = rawResponse;

  return await payment.save();
};

// 결제 상세 조회
export const getPaymentByKey = async (paymentKey) => {
  const payment = await Payment.findOne({ paymentKey }).populate(
    "reservation",
    "checkIn checkOut guests status"
  );

  if (!payment) {
    const err = new Error("PAYMENT_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  return payment;
};
