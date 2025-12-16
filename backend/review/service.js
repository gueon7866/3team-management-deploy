// ⬇⬇ review/service.js 전체를 이걸로 교체 ⬇⬇
import Review from "./model.js";
import {Hotel} from "../hotel/model.js";

// OWNER: 유저가 신고한 내 호텔 리뷰 목록
export const getReportedReviewsForOwner = async ({
  ownerId,
  page = 1,
  limit = 20,
}) => {
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

  const filter = {
    hotelId: { $in: hotelIds },
    isReportedByUser: true,
  };

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Review.countDocuments(filter);

  const items = await Review.find(filter)
    .populate("userId", "name email")
    .populate("hotelId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return {
    items,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

// OWNER: 어드민에게 신고(이관)
export const escalateReviewToAdmin = async (reviewId, ownerId, reason) => {
  const review = await Review.findById(reviewId).populate("hotelId", "owner");

  if (!review) {
    const err = new Error("REVIEW_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  const hotelOwnerId = review.hotelId?.owner?.toString();
  if (!hotelOwnerId || hotelOwnerId !== ownerId.toString()) {
    const err = new Error("REVIEW_NOT_BELONG_TO_OWNER");
    err.statusCode = 403;
    throw err;
  }

  review.isEscalatedByOwner = true;
  review.ownerReportReason = reason || "";
  review.adminReportStatus = "pending";

  await review.save();
  return review;
};

// ADMIN: 신고된 리뷰 목록
export const getReportedReviewsForAdmin = async ({
  status = "pending",
  page = 1,
  limit = 20,
}) => {
  const filter = {
    isEscalatedByOwner: true,
  };

  if (status === "pending") {
    filter.adminReportStatus = "pending";
  } else if (status === "approved") {
    filter.adminReportStatus = "approved";
  } else if (status === "rejected") {
    filter.adminReportStatus = "rejected";
  }

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Review.countDocuments(filter);

  const items = await Review.find(filter)
    .populate("userId", "name email")
    .populate("hotelId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return {
    items,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

// ADMIN: 신고 승인 → 리뷰 삭제
export const approveReviewReport = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("REVIEW_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  review.adminReportStatus = "approved";
  await review.save();

  await Review.deleteOne({ _id: reviewId });

  return reviewId;
};

// ADMIN: 신고 거부 → 리뷰 유지
export const rejectReviewReport = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("REVIEW_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }

  review.adminReportStatus = "rejected";
  review.isEscalatedByOwner = false;

  await review.save();
  return review;
};
// ⬆⬆ review/service.js 전체 교체 끝 ⬆⬆
