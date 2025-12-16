// ⬇⬇ review/model.js 파일이 없다면, 새로 만들고 전체를 이걸로 넣기 ⬇⬇
import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const reviewSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // --- 신고 관련 필드들 ---

    // 유저가 신고했는지 여부 + 이유
    isReportedByUser: {
      type: Boolean,
      default: false,
    },
    userReportReason: {
      type: String,
      default: "",
    },

    // 오너가 어드민에게 이관(신고)했는지 여부 + 이유
    isEscalatedByOwner: {
      type: Boolean,
      default: false,
    },
    ownerReportReason: {
      type: String,
      default: "",
    },

    // 어드민의 처리 상태: pending(대기) / approved(삭제 승인) / rejected(신고 기각)
    adminReportStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Review = dbConnection.model("Review", reviewSchema);
export default Review;
// ⬆⬆ review/model.js 전체 생성 끝 ⬆⬆
