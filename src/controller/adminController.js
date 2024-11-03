import { Company } from "../models/company.model.js";
import { Employee } from "../models/employee.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../utils/password.js";
// Register a new admin
export const adminRegister = async (req, res) => {
  try {
    const { companyName, companyLocation, userName, Email, Password } =
      req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newCompany = new Company({
      companyName,
      companyLocation,
      userName,
      Email,
      Password: hashedPassword,
    });

    await newCompany.save();
    res.status(201).send({
      success: true,
      message: "Admin registered successfully",
      company: newCompany,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error registering admin" });
  }
};

// Admin login
// export const adminLogin = async (req, res) => {
//   try {
//     const { Email, Password } = req.body;
//     const admin = await Company.findOne({ Email });
//     if (!admin || !(await bcrypt.compare(Password, admin.Password))) {
//       return res.status(401).send({ error: "Invalid credentials" });
//     }

//     // Generate a token (for simplicity)
//     const token = "generated-token"; // Replace with actual token generation logic
//     admin.refreshToken = token;
//     await admin.save();

//     res.status(200).send({ success: true, message: "Login successful", token });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .send({ success: false, error, message: "Error logging in" });
//   }
// };

export const adminLogin = async (req, res) => {
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

// Admin logout
export const adminLogout = async (req, res) => {
  try {
    const admin = await Company.findOneAndUpdate(
      { refreshToken: req.token },
      { refreshToken: null }
    );
    if (!admin) {
      return res.status(404).send({ error: "Admin not found" });
    }

    res.status(200).send({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error logging out" });
  }
};

// Change admin password
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const admin = await Company.findOneAndUpdate(
      { refreshToken: req.token },
      { Password: hashedPassword }
    );

    if (!admin) {
      return res.status(404).send({ error: "Admin not found" });
    }

    res
      .status(200)
      .send({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error changing password" });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const { EmployeeName, EmployeeEmail, Password, companyName } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);

    const employee = new Employee({
      EmployeeName,
      EmployeeEmail,
      Password: hashedPassword,
      companyName,
    });

    await employee.save();
    await Company.findOneAndUpdate(
      { companyName },
      { $push: { Employees: employee._id } }
    );

    res.status(201).send({
      success: true,
      message: "Employee added successfully",
      employee,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error adding employee" });
  }
};
export const updateEmployee = async (req, res) => {
  try {
    const { EmployeeEmail } = req.params;
    const { EmployeeName, Password, companyName } = req.body;

    switch (true) {
      case !EmployeeEmail:
        return res.status(500).send({ error: "EmployeeEmail is required" });
      case !EmployeeName:
        return res.status(500).send({ error: "EmployeeName is required" });
      case !Password:
        return res.status(500).send({ error: "Password is required" });
      case !companyName:
        return res.status(500).send({ error: "Company Name is required" });
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { EmployeeEmail },
      { EmployeeName, Password, companyName },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).send({ error: "Employee not found" });
    }

    res.status(200).send({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating employee",
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { EmployeeEmail } = req.params;

    const deletedEmployee = await Employee.findOneAndDelete({ EmployeeEmail });

    if (!deletedEmployee) {
      return res.status(404).send({ error: "Employee not found" });
    }

    res.status(200).send({
      success: true,
      message: "Employee deleted successfully",
      employee: deletedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting employee",
    });
  }
};
