import express from "express";
const router = express.Router();
import Cart from "../models/CartSchema.js";
import Product from "../models/ProductSchema.js";
import {cookieAuth} from "../auth/middleware.js";

router.get("/", cookieAuth, async(req,res)=>{
    try{
        let cart = await Cart.findOne({user:req.user.id}).populate("items.product","name price coverImage stock")

        if(!cart){
            cart = new Cart({user:req.user.id,items:[]})
            await cart.save()
        }

       return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      cart,
    });


    }catch(error){
         console.error("Error retrieving cart:", error);
       return res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
    }
})

router.post("/add",cookieAuth, async(req,res)=>{
    console.log("req.body:", req.body);
    try {

        const {productId} = req.body
        console.log("Received productId:", productId); 

        const product = await Product.findById(productId)


         let cart = await Cart.findOne({user:req.user.id}).populate("items.product","name price coverImage stock")

        if(!cart){
            cart = new Cart({user:req.user.id,items:[]})
           
        }

       const itemIndex = cart.items.findIndex(
        it => (it.product._id ? it.product._id.toString() : it.product.toString()) === productId
);

        if(itemIndex  > -1){
            cart.items[itemIndex].quantity +=1
        }else{
            cart.items.push({product:productId, price:product.price, quantity:1})
        }
       product.stock -=1
        await  product.save()

        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
       cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.    quantity, 0);

     await cart.save()


       const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name price coverImage stock");

         return res.json({ success: true, cart:populatedCart });
        
    } catch (error) {
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
})


router.put("/update", cookieAuth, async(req,res)=>{
    try {

        const {productId,quantity} = req.body



        let cart = await Cart.findOne({user:req.user.id}).populate("items.product","name price coverImage stock")

        if(!cart){
        return res.status(404).json({ message: "Cart not found" });
           
        }

       const item = cart.items.find(it => it.product._id.toString() ===productId)

       const product = await Product.findById(productId)

       const diff = quantity  - item.quantity

       if(diff > 0){
        if(product.stock < diff) return res.status(400).json({ message: "Not enough stock" });

        product.stock -= diff 
       }else{
         product.stock += Math.abs(diff);

       }

       item.quantity = quantity
       await product.save()

       cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
       cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

       await cart.save()

        const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name price coverImage stock");

         return res.json({ success: true, cart:populatedCart });

        
    } catch (err) {
         res.status(500).json({ message: "Error updating cart", error: err.message });
    }
})


router.delete("/remove/:productId", cookieAuth, async(req,res)=>{
    try {
        const {productId} = req.params
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex =cart.items.findIndex(it => it.product.toString() === productId)

        if(itemIndex === -1 ){
         return res.status(404).json({ message: "Item not found in cart" });
        }
        const item = cart.items[itemIndex]
        const product = await Product.findById(productId);

        if(product){
            product.stock +=1
            await product.save()
        }

        cart.items.splice(itemIndex, 1)
        


        await cart.save()

        const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name price coverImage stock");

          res.json({ success: true, cart:populatedCart });

    } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });

    }
})





export default router;
