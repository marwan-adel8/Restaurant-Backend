import express from "express";
import Order from "../models/OrderSchema.js";
import Product from "../models/ProductSchema.js";
import { cookieAuth } from "../auth/middleware.js";

const router = express.Router();

// إنشاء طلب جديد
router.post("/createOrder", async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, notes } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // حساب المبلغ الإجمالي
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product ${item.productId} not found` });
      }

      // حساب السعر مع الخصم إذا كان موجود
      let itemPrice = product.price;
      if (product.discountPercent && parseFloat(product.discountPercent) > 0) {
        itemPrice = product.price - (product.price * parseFloat(product.discountPercent) / 100);
      }

      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice,
        name: product.name,
      });
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount,
      notes: notes || "",
    });

    await newOrder.save();
    res.status(201).json({ 
      msg: "Order created successfully", 
      order: newOrder,
      orderId: newOrder._id 
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// جلب جميع الطلبات (للإدارة)
router.get("/getOrders", cookieAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name coverImage")
      .sort({ orderDate: -1 });
    
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// تحديث حالة الطلب
router.put("/updateOrderStatus/:id", cookieAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.product", "name coverImage");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    res.status(200).json({ msg: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// حذف طلب
router.delete("/deleteOrder/:id", cookieAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    res.status(200).json({ msg: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

export default router;
