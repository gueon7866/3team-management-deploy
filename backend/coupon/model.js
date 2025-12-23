// ⬇⬇ coupon/model.js 전체를 이걸로 교체 ⬇⬇
import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";
const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    // 쿠폰이 특정 사업자 전용인 경우에만 설정 (전역 쿠폰은 null 가능)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 쿠폰 받는 사업자
      required: false,
      default: null,
    },
    // 사업자 번호 (owner와 함께 저장, 검색 편의용)
    ownerBusinessNumber: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 쿠폰 발급한 admin
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export const Coupon = dbConnection.model("Coupon", couponSchema);
export default Coupon;
// ⬆⬆ coupon/model.js 전체 교체 끝 ⬆⬆
