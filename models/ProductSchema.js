import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },

  price: {
    type: Number,
    require: true,
  },

  stock: {
    type: Number,
    require: true,
    default: 0,
  },

  isFeatured: {
    type: Boolean,

    default: false,
  },

  isOnSale: {
    type: Boolean,

    default: false,
  },

  discountPercent: {
    type: String,

    default: false,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
  },

  coverImage: {
    type: String,
  },
});

const Product = mongoose.model("Products", ProductSchema);
export default Product;
