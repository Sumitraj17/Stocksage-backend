import { Company } from "../models/company.model.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/password.js";

const adminRegister = async (req, res) => {
  // Fetch data from the request body
  const { companyName, companyLocation, userName, Email, Password } = req.body;

  // Check if all required fields are provided
  if (!companyLocation || !companyName || !userName || !Email || !Password)
    return res
      .status(400)
      .json({ status: "Error", message: "Provide all data" });

  try {
    // Check if the company or email already exists
    const isUser = await Company.findOne({
      $or: [{ Email }, { companyName }],
    });

    if (isUser)
      return res.status(400).json({
        status: "Bad Request",
        message: "Company or Email Already Exists",
      });

    // Hash the password before storing it
    const hashedPassword = await hashPassword(Password);
    // Create new company object
    const company = await new Company({
      companyName: companyName,
      companyLocation: companyLocation,
      userName: userName,
      Email: Email,
      Password: hashedPassword, // Store hashed password
    });

    // Save the company to the database
    await company.save();

    // Return success response
    return res.status(200).json({
      status: "Success",
      message: "Company profile created",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging

    // Return internal server error response
    return res.status(500).json({
      status: "Internal Error",
      message: "Something went wrong",
    });
  }
};

const adminLogin = async(req,res)=>{
    const {userName,Email,Password} = req.body;

    if(!userName || !Email || !Password)
        return res.status(400).json({status:'Error',message:'Provide All details'})

    const isUser = await Company.findOne({Email})

    if(!isUser)
        return res.status(400).json({status:'Bad Request',message:'Company does not exists'})

    const validPassword = await comparePassword(isUser.Password,Password)
    
    if(!validPassword)
        return res.status(400).json({status:'Bad Request',message:'Invalid Password'})

    jwt.sign({id:isUser._id},process.env.SECRET_KEY,async(err,token)=>{
        if(err)
            return res.status(500).json({status:'Internal Server Error',message:'Something went wrong'})
        
        isUser.refreshToken = token;
        const user = await Company.findById(isUser._id).select(" -Password -refreshToken");
        return res
        .status(200)
        .cookie('accessToken',token,{httpOnly:true,secure:true})
        .json({
            status:'Success',
            message:'User login successfull',
            user
        })
    })

}

const addEmployee = async(req,res)=>{
    return res.status(200).json({status:'Success',message:'Working',user:req.user})
}

export { adminRegister,adminLogin,addEmployee};
