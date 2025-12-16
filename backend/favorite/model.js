// favorite/model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
  },
  { timestamps: true }
);

// 유니크 제약: 한 유저가 같은 호텔을 중복으로 즐겨찾기 못 하도록
favoriteSchema.index({ user: 1, hotel: 1 }, { unique: true });

favoriteSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.model("Favorite", favoriteSchema);
