// routes/product.js
import express from "express";
const router = express.Router();

// استيراد الـ Models
import Product from "../models/ProductSchema.js";
import Category from "../models/CategorySchema.js";

// استيراد الـ Middlewares
// ⚠️ تم حذف استيراد Multer وكود DiskStorage لتجنب خطأ التعريف المكرر
import { cookieAuth } from "../auth/middleware.js";
import upload from "../auth/upload.js"; // ⬅️ هذا هو وسيط Cloudinary/Multer الذي نستخدمه

// ----------------------------------------------------------------------
// 1. POST /addProduct - إضافة منتج جديد
// ----------------------------------------------------------------------

router.post(
  "/addProduct",
  cookieAuth,
  upload.single("coverImage"), // استخدام وسيط رفع Cloudinary
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        stock,
        isFeautred,
        categoryName,
        discountPercent,
        isOnSale,
      } = req.body;

      const trimmedCategoryName = categoryName ? categoryName.trim() : null;
      if (!name || !description || !price || !stock || !trimmedCategoryName) {
        return res.status(400).json({
          msg: "Please enter all required fields including a valid category name.",
        });
      } // 1. البحث عن التصنيف أو إنشائه

      let productCategoryId;
      let existingCategory = await Category.findOne({
        name: trimmedCategoryName,
      });

      if (existingCategory) {
        productCategoryId = existingCategory._id;
      } else {
        const newCategory = new Category({ name: trimmedCategoryName });
        await newCategory.save();
        productCategoryId = newCategory._id;
      } // 2. إنشاء المنتج

      const newProduct = new Product({
        name,
        description,
        price,
        stock,
        isFeatured: isFeautred,
        category: productCategoryId,
        discountPercent,
        isOnSale, // 🔑 استخدام req.file.path لتخزين رابط Cloudinary
        coverImage: req.file?.path,
      });

      await newProduct.save();
      res
        .status(200)
        .json({ msg: "Product added successfully", product: newProduct });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
);

// ----------------------------------------------------------------------
// 2. GET /getProducts - جلب جميع المنتجات
// ----------------------------------------------------------------------

router.get("/getProducts", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------------------------------------------------
// 3. PUT /updateProduct/:id - تحديث منتج
// ----------------------------------------------------------------------

router.put(
  "/updateProduct/:id",
  cookieAuth,
  upload.single("coverImage"),
  async (req, res) => {
    try {
      let updateBody = req.body; // 🔑 استخدام req.file.path لتخزين رابط Cloudinary عند التحديث
      if (req.file) {
        updateBody.coverImage = req.file.path;
      }
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateBody,
        { new: true }
      ).populate("category", "name");

      if (!product) {
        return res.status(404).json({ msg: "Product not found" });
      }
      res.status(200).json({ msg: "Product updated successfully", product });
    } catch (error) {
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
);

// ----------------------------------------------------------------------
// 4. DELETE /deleteProduct/:id - حذف منتج
// ----------------------------------------------------------------------

router.delete("/deleteProduct/:id", cookieAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    res.json({ message: "product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// 5. GET /:id - جلب منتج واحد بالـ ID
// ----------------------------------------------------------------------

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

export default router;
