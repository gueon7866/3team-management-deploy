// payment/controller.js
import * as paymentService from "./service.js";
import { successResponse, errorResponse } from "../common/response.js";

// POST /api/payments/record
// (선택) 결제 레코드를 미리 만드는 용도
export const createPaymentRecord = async (req, res) => {
  try {
    const { reservationId, paymentKey, orderId, amount, rawResponse } =
      req.body;

    const payment = await paymentService.createPaymentRecord(
      req.user.id,
      reservationId,
      { paymentKey, orderId, amount, rawResponse }
    );

    return res
      .status(201)
      .json(successResponse(payment, "PAYMENT_RECORD_CREATED", 201));
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// GET /api/payments/:paymentKey
export const getPaymentDetail = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByKey(
      req.params.paymentKey
    );

    return res
      .status(200)
      .json(successResponse(payment, "PAYMENT_DETAIL", 200));
  } catch (err) {
    return res
      .status(err.statusCode || 404)
      .json(errorResponse(err.message, err.statusCode || 404));
  }
};
