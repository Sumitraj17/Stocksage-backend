import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    CompanyName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    CompanyLocation: {
      type: String,
      required: true,
      lowercase: true,
    },
    AdminName: {
      type: String,
      required: true,
      lowercase: true,
    },
    AdminEmail: {
      type: String, 
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ], 
    },
    Password: {
      type: String, 
      required: true,
    },
    Employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', 
      },
    ],
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', CompanySchema);
