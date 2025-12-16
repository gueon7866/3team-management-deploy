// payment/model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reservation: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },

    provider: { type: String, default: "toss" },

    paymentKey: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "failed"],
      default: "pending",
    },

    rawResponse: { type: Object }, // Toss에서 받은 원본 데이터 저장용
  },
  { timestamps: true }
);

paymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.model("Payment", paymentSchema);
