import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    companyName:{
      type:String,
      required:true
    },
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    totalStock: {
      type: Number,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Products = mongoose.model("Products", productSchema);
