import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    companyLocation: {
      type: String,
      required: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
      lowercase: true,
    },
    Email: {
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
    refreshToken:{
        type:String
    }
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', CompanySchema);