// ⬇⬇ review/controller.js 전체를 이걸로 넣어도 되는 버전 ⬇⬇
import { successResponse, errorResponse } from "../common/response.js";
import {
  getAllReviewsForOwner,
  getReportedReviewsForOwner,
  escalateReviewToAdmin,
  getReportedReviewsForAdmin,
  approveReviewReport,
  rejectReviewReport,
} from "./service.js";

// OWNER: 내 호텔의 모든 리뷰 목록
export const getOwnerReviews = async (req, res) => {
  try {
    console.log("✅ getOwnerReviews called");
    console.log("   User:", req.user?.id || req.user?._id);
    console.log("   Query:", req.query);
    const ownerId = req.user.id || req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const data = await getAllReviewsForOwner({
      ownerId,
      page,
      limit,
    });

    return res
      .status(200)
      .json(successResponse(data, "OWNER_REVIEW_LIST", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// OWNER: 유저가 신고한 내 호텔 리뷰 목록
export const getOwnerReportedReviews = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const data = await getReportedReviewsForOwner({
      ownerId,
      page,
      limit,
    });

    return res
      .status(200)
      .json(successResponse(data, "OWNER_REPORTED_REVIEW_LIST", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// OWNER: 특정 리뷰를 어드민에게 신고(이관)
export const escalateReview = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user._id;
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await escalateReviewToAdmin(reviewId, ownerId, reason);

    return res
      .status(200)
      .json(successResponse(review, "REVIEW_ESCALATED_TO_ADMIN", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 오너가 이관한 리뷰 신고 목록
export const getAdminReportedReviews = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;

    const data = await getReportedReviewsForAdmin({
      status,
      page,
      limit,
    });

    return res
      .status(200)
      .json(successResponse(data, "ADMIN_REPORTED_REVIEW_LIST", 200));
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 신고 승인 → 리뷰 삭제
export const approveReviewReportController = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const deletedReviewId = await approveReviewReport(reviewId);

    return res
      .status(200)
      .json(
        successResponse(
          { deletedReviewId },
          "REVIEW_REPORT_APPROVED_AND_DELETED",
          200
        )
      );
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};

// ADMIN: 신고 거부 → 리뷰 유지
export const rejectReviewReportController = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await rejectReviewReport(reviewId);

    return res
      .status(200)
      .json(
        successResponse(review, "REVIEW_REPORT_REJECTED", 200)
      );
  } catch (err) {
    console.error(err);
    return res
      .status(err.statusCode || 400)
      .json(errorResponse(err.message, err.statusCode || 400));
  }
};
// ⬆⬆ review/controller.js 전체 교체/생성 끝 ⬆⬆
