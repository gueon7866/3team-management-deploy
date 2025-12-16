// ⬇⬇ hotel/model.js 전체 교체 ⬇⬇
import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    // 이 호텔의 소유자 (owner_db.User)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // 필요하면 여기 나머지 필드들(설명, 가격, 이미지 등) 그대로 추가
  },
  { timestamps: true }
);

// ✅ 핵심: 기본 mongoose.model 이 아니라 businessConnection.model 사용
export const Hotel = dbConnection.model("Hotel", hotelSchema);
export default Hotel;
// ⬆⬆ hotel/model.js 전체 교체 끝 ⬆⬆
