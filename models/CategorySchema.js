import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

const Category = mongoose.model("Categories", CategorySchema);

export default Category;
