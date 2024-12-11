import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    companyName:{
      type:String
    },
    id:{
      type:Number
    },
    productName:{
      type:String
    },
    storeId:{
      type:Number
    },
    productId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
    },
    unitsSold: {
      type: Number,
      required: true,
    },
    sales:{
      type:Number
    },
    month: {
      type: String,
      required: true,
    },
    filePath:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

export const Sales = mongoose.model("Sales", salesSchema);
