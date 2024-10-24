import { Company } from "../models/company.model.js";

import { Employee } from "../models/employee.model.js"; // Employee model import
import jwt from "jsonwebtoken"; // JWT for token generation
import { hashPassword, comparePassword } from "../utils/password.js"; // Password utilities for hashing and comparing
import Mailer from "../utils/mailer.js"; // Utility for sending emails
import { adminTemplate } from "../constants/email.template.js"; // Email template for admin registration confirmation
import { employeeTemplate } from "../constants/employee.template.js";

// Admin registration function
const adminRegister = async (req, res) => {
  // Fetch data from the request body
  const { companyName, companyLocation, userName, Email, Password } = req.body;

  // Check if all required fields are provided
  if (!companyLocation || !companyName || !userName || !Email || !Password)
    return res
      .status(400)
      .json({ status: "Error", message: "Provide all data" });

  try {
    // Check if the company or email already exists in the database
    const isUser = await Company.findOne({
      $or: [{ Email }, { companyName }],
    });

    // If company or email exists, return an error response
    if (isUser)
      return res.status(400).json({
        status: "Bad Request",
        message: "Company or Email Already Exists",
      });

    // Hash the password before storing it in the database
    const hashedPassword = await hashPassword(Password);

    // Create new company object with hashed password
    const company = await new Company({
      companyName: companyName,
      companyLocation: companyLocation,
      userName: userName,
      Email: Email,
      Password: hashedPassword, // Store hashed password
    });

    // Save the company to the database
    await company.save();

    const text = adminTemplate(companyName, companyLocation, userName);
    Mailer(
      Email,
      "Your Company has been Successfully Registered on StockSage!",
      text
    );


    return res.status(200).json({
      status: "Success",
      message: "Company profile created",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging

    // Return internal server error response in case of an issue
    return res.status(500).json({
      status: "Internal Error",
      message: "Something went wrong",
    });
  }
};


// Admin login function
const adminLogin = async (req, res) => {
  const { userName, Email, Password } = req.body;

  // Check if all login details are provided

  if (!userName || !Email || !Password)
    return res
      .status(400)
      .json({ status: "Error", message: "Provide All details" });


  // Find the company by email
  const isUser = await Company.findOne({ Email });

  // If company is not found, return an error response
  if (!isUser)
    return res
      .status(400)
      .json({ status: "Bad Request", message: "Company does not exist" });

  // Compare the provided password with the stored hashed password
  const validPassword = await comparePassword(isUser.Password, Password);

  // If the password is invalid, return an error response

  if (!validPassword)
    return res
      .status(400)
      .json({ status: "Bad Request", message: "Invalid Password" });


  jwt.sign({ id: isUser._id }, process.env.SECRET_KEY, async (err, token) => {
    if (err)
      return res.status(500).json({
        status: "Internal Server Error",
        message: "Something went wrong",
      });


    // Set the refresh token for the user
    isUser.refreshToken = token;

    // Select user data excluding sensitive fields (password and refreshToken)
    const user = await Company.findById(isUser._id).select(
      " -Password -refreshToken"
    );

    // Return success response, set the token in cookies

    return res
      .status(200)
      .cookie("accessToken", token, { httpOnly: true, secure: true })
      .json({
        status: "Success",
        message: "User login successful",
        admin: true,
        user,
      });
  });
};


// Add an employee function
const addEmployee = async (req, res) => {
  const { EmployeeName, EmployeeEmail, Password, companyId } = req.body;

  // Check if all employee data is provided
  if (!EmployeeName || !EmployeeEmail || !Password || !companyId) {
    return res.status(400).json({
      status: "Error",
      message: "Provide all data including company ID",
    });
  }

  try {
    // Check if the employee with the same email already exists
    const isUser = await Employee.findOne({ EmployeeEmail });

    // If employee exists, return an error response
    if (isUser) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Employee with this email already exists",
      });
    }

    // Hash the employee's password
    const hashedPassword = await hashPassword(Password);

    // Create and save the new employee object in the database
    const employee = await Employee.create({
      EmployeeName,
      EmployeeEmail,
      Password: hashedPassword,
    });

    // If employee creation fails, return an error response
    if (!employee) {
      return res.status(500).json({
        status: "Error",
        message: "Failed to create employee",
      });
    }

    // Add employee to the company's Employees array
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $push: { Employees: employee._id } },  // Add employee to company
      { new: true }  // Return the updated company document
    );

    // If adding to the company fails, return an error
    if (!updatedCompany) {
      return res.status(500).json({
        status: "Error",
        message: "Failed to add employee to the company",
      });
    }

    // Send email notification to the new employee
    const text = employeeTemplate(EmployeeName, EmployeeEmail, Password);
    Mailer(EmployeeEmail, "Welcome to StockSage!", text);

    // Return success response
    return res.status(200).json({
      status: "Success",
      message: "Employee created, added to company, and email sent",
      employee,
      updatedCompany
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: "Something went wrong",
    });
  }
};

// Change admin password function

const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { Password } = req.body;

    // Hash the new password
    const hashedPassword = await hashPassword(Password);

    // Update the user's password in the database
    await Company.findByIdAndUpdate(
      user._id,
      {
        $set: {
          Password: hashedPassword,
        },
      },
      {
        new: true, // Return the updated document
      }
    );

    // Return success response after updating password

    return res
      .status(200)
      .json({ status: "Success", message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({
      status: "Internal server error",
      message: "Something went wrong",
    });
  }
};


// Admin logout function
const adminLogout = async (req, res) => {
  try {
    const user = req.user;

    // Remove the refresh token from the user's document

    await Company.findByIdAndUpdate(
      user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true, // Return the updated document
      }
    );

    // Clear the access token from cookies and return success response
    return res
      .status(200)
      .clearCookie("accessToken", { httpOnly: true, secure: true })
      .json({ status: "Success", message: "User logged out Successfully" });
  } catch (error) {
    return res.status(500).json({
      status: "Internal server error",
      message: "Something went wrong",
    });
  }
};
export { adminRegister, adminLogin, addEmployee, adminLogout, changePassword };
