// ملف Category Router
import express from "express";
const router = express.Router();
import Category from "../models/CategorySchema.js";
import { cookieAuth } from "../auth/middleware.js"; // 💡 استيراد الـ middleware

// ----------------------------------------------------------------------
// 1. إنشاء التصنيف (مُؤمَّن)
// ----------------------------------------------------------------------
router.post("/createCategory", cookieAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ msg: "Name is required" });
    }

    const newCategory = new Category({ name });

    await newCategory.save();
    res
      .status(201)
      .json({ msg: "Category Created successfully", Category: newCategory });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// ----------------------------------------------------------------------
// 2. جلب التصنيفات (مُؤمَّن)
// ----------------------------------------------------------------------
router.get("/getCategories", cookieAuth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

export default router;
