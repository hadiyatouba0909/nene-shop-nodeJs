// models/Product.js
import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  variants: [variantSchema],
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
  totalQuantity: { type: Number, required: true, default: 0 },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ajouter le middleware pour filtrer les produits supprimés
productSchema.pre(["find", "findOne"], function (next) {
  if (this.getQuery().includeDeleted) {
    return next();
  }

  if (!this.getQuery().hasOwnProperty("deletedAt")) {
    this.where({ deletedAt: null });
  }
  next();
});

export default mongoose.model("Product", productSchema);
