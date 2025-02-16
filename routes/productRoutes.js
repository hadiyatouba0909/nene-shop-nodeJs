// routes/productRoutes.js
import express from "express";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getDeletedProducts,
  restoreProduct,
} from "../controllers/productController.js";
import { isAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/", isAdmin, upload.array("images", 5), addProduct);
router.put("/:id", isAdmin, upload.array("images", 5), updateProduct);
router.delete("/:id", isAdmin, deleteProduct);
router.get("/", getProducts);
router.get("/deleted", isAdmin, getDeletedProducts);
router.post("/:id/restore", isAdmin, restoreProduct);

export default router;
