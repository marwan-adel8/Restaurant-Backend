import mongoose from "mongoose";
import "../models/ProductSchema.js";


const CartItemSchema = new mongoose.Schema({
 product:{
        type:mongoose.Schema.Types.ObjectId, ref: "Products",
        required: true
    
 },
  quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },

     price: {
        type: Number,
        required: true
    }

    });


const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true,
        unique: true
    },
    items: [CartItemSchema],
     totalAmount: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }

});


const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
