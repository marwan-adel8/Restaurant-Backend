// routes/product.js
import express from "express";
const router = express.Router();

// استيراد الـ Models
import Product from "../models/ProductSchema.js";
import Category from "../models/CategorySchema.js";

// استيراد الـ Middlewares
import { cookieAuth } from "../auth/middleware.js";
// 🔑 استيراد وسيط Cloudinary/Multer الذي قمت بتعريفه في ملف آخر
import upload from "../auth/upload.js";

// 🛑 تم حذف:
// import multer from "multer";
// const storage = multer.diskStorage(...);
// const upload = multer({ storage: storage });
//
// تم حذف هذا الجزء لتجنب خطأ "Identifier 'upload' has already been declared"

// ----------------------------------------------------------------------
// 1. مسارات الـ POST /addProduct - إضافة منتج جديد
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
        return res.status(400).json({ msg: "Please enter all the fields" });
      } // البحث عن التصنيف أو إنشائه

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
      }

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
      console.error("Error in /addProduct:", error);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
);

// ----------------------------------------------------------------------
// 2. مسارات الـ GET الثابتة /getProducts
// ----------------------------------------------------------------------

router.get("/getProducts", cookieAuth, async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error in /getProducts:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------------------------------------------------
// 3. مسارات الـ PUT و DELETE
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
      console.error("Error in /updateProduct:", error);
      res.status(500).json({ msg: "Server error", error: error.message });
    }
  }
);

router.delete("/deleteProduct/:id", cookieAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    res.json({ message: "product deleted successfully" });
  } catch (error) {
    console.error("Error in /deleteProduct:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// 4. مسار الـ GET الديناميكي /:id (يجب أن يكون في النهاية)
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
    console.error("Error in /:id GET:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

export default router;
