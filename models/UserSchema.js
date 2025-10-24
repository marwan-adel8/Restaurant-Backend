import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true,
        unique:true
    },

    name:{
        type:String,
        require:true,
     
    },

    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        default:"user",
    }

});

const User = mongoose.model("User", userSchema);

export default User;
