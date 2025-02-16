// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
        price: Number,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    additionalInfo: String,
    status: {
      type: String,
      enum: ["en cours", "annulée", "livrée"],
      default: "en cours",
    },
    paymentStatus: {
      type: String,
      enum: ["payé"],
      default: "payé",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
