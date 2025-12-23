// 일반 회원(User 서비스)용 모델 - users 컬렉션을 대상으로 함
import mongoose from "mongoose";
import { dbConnection } from "../config/db.js";

const generalUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: false,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: "user",
    },
    // 계정 상태
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users", // 일반 회원이 저장된 컬렉션 이름
    timestamps: true,
  }
);

generalUserSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  },
});

export const GeneralUser = dbConnection.model("GeneralUser", generalUserSchema);
export default GeneralUser;


