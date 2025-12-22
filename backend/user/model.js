// user/model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { dbConnection } from "../config/db.js";

const userSchema = new mongoose.Schema(
  {
    // 기본 정보
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // 항상 해시된 비밀번호로 저장
    },

    // 사업자 번호 (owner 전용)
    businessNumber: {
      type: String,
      trim: true,
    },

    // 연락처
    phone: {
      type: String,
      trim: true,
    },

    // 프로필 이미지 URL (S3)
    profileImage: {
      type: String,
      trim: true,
    },

    // 권한 (일반 회원까지 포함)
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "owner",
    },

    // 계정 상태
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // 마지막 로그인 시간
    lastLoginAt: {
      type: Date,
    },
  },
  {
    // ❗ 실제 MongoDB 컬렉션 이름
    collection: "owner_users",
    timestamps: true, // createdAt, updatedAt 자동 추가
  }
);

// 이메일 유니크 인덱스
userSchema.index({ email: 1 }, { unique: true });

// 저장 전 비밀번호 해시
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// JSON 응답에서 민감 정보 제거
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  },
});

// (선택) 인스턴스 메서드 – 지금은 안 써도 됨
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = dbConnection.model("User", userSchema);
export default User;
