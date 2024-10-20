import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'; 

const EmployeeSchema = new mongoose.Schema(
  {
    Id: {
      type: String,
      default: uuidv4, 
    },
    EmployeeName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    EmployeeEmail: {
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
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", EmployeeSchema);
