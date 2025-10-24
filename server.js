import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/product.js";
import connectDB from "./config/db.js";
import categoryRoutes from "./routes/category.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/carts.js";
import orderRoutes from "./routes/order.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully!"))
  .catch((err) => console.error("❌ Cloudinary connection failed:", err.message));



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
connectDB();

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/category", categoryRoutes);
app.use("/admin", adminRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/images", express.static("images"));

app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
