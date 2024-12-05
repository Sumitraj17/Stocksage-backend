import { Company } from "../models/company.model.js";

import { Employee } from "../models/employee.model.js"; // Employee model import
import jwt from "jsonwebtoken"; // JWT for token generation
import { hashPassword, comparePassword } from "../utils/password.js"; // Password utilities for hashing and comparing
import Mailer from "../utils/mailer.js"; // Utility for sending emails
import { adminTemplate } from "../constants/email.template.js"; // Email template for admin registration confirmation
import { employeeTemplate } from "../constants/employee.template.js";
import { v4 as uniqueId } from "uuid";

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

// Add an employee function
const addEmployee = async (req, res) => {
  try {
    const { EmployeeName, EmployeeEmail, Password, companyName } = req.body;

    // Validate input fields
    if (!EmployeeName || !EmployeeEmail || !Password || !companyName) {
      return res.status(400).send({ error: "All fields are required" });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ EmployeeEmail });
    if (existingEmployee) {
      return res.status(400).send({ error: "Employee already exists" });
    }

    // Create new employee
    const newEmployee = new Employee({
      EmployeeName,
      EmployeeEmail,
      Password,
      companyName,
    });
    await newEmployee.save();

    // Update the company with the new employee
    const company = await Company.findOne({ companyName });
    if (company) {
      // Ensure Employees array is initialized
      if (!company.Employees) {
        company.Employees = []; // Initialize as an empty array if not present
      }

      company.Employees.push(newEmployee._id); // Add new employee to the array
      await company.save();
    } else {
      // If no company is found, handle the case (optional)
      return res.status(400).send({ error: "Company not found" });
    }

    res.status(201).send({
      success: true,
      message: "Employee added successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in adding employee",
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  const { EmployeeEmail } = req.params; // Get email from the URL params
  const { EmployeeName, Password, companyName } = req.body; // Get updated data from the request body

  // Validate required fields
  if (!EmployeeEmail) {
    return res.status(400).json({ message: "Employee email is required" });
  }

  if (!EmployeeName && !Password && !companyName) {
    return res
      .status(400)
      .json({ message: "At least one field to update is required" });
  }

  try {
    // Find and update the employee
    const updatedEmployee = await Employee.findOneAndUpdate(
      { EmployeeEmail },
      { EmployeeName, Password, companyName },
      { new: true } // Return the updated document
    );

    // Check if employee was found and updated
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Respond with success message and updated employee
    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (err) {
    console.error("Error updating employee:", err);

    // Handle unexpected server errors
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the employee",
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  const { EmployeeEmail } = req.params;

  try {
    const deletedEmployee = await Employee.findOneAndDelete({ EmployeeEmail });

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    // Fetching employees from the database
    const employees = await Employee.find(); // Assuming Employee is your model

    // Check if 'companyName' exists in each employee object
    const employeesWithCompanyName = employees.map((employee) => {
      if (!employee.companyName) {
        console.warn(
          `Employee with email ${employee.EmployeeEmail} is missing companyName`
        );
      }
      return employee;
    });

    res.json(employeesWithCompanyName);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

export {
  adminRegister,
  adminLogin,
  addEmployee,
  adminLogout,
  changePassword,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
};
