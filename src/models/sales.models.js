import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    unitsSold: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Sales = mongoose.model("Sales", salesSchema);
