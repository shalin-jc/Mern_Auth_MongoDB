
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../config/nodemailer.js";


export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = {
      status: 422,
      message: "All fields are required",
      extraDetails: "Name, email, and password must be provided",
    };
    return next(error);
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // if(!avatarLocalPath){
    //     return res.status(422).json({success: false, message: "Avatar file is required"})
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // if(!avatar){
    //     return res.status(500).json({success: false, message: "Avatar upload failed"})

    // }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    // Try to send email, but don't fail registration if it errors
  

sendEmail('recipient@example.com', 'Test Email', 'This is a test email')
    .then(() => console.log('Email sent successfully'))
    .catch(err => console.error('Error sending email:', err))

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
    
  } catch (error) {
    console.error(error);
    const err = {
      status: 500,
      message: "Registration failed",
      extraDetails: error.message,
    };
    return next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    // return res.json({success: false, message: error.message})
    console.error(error);
    const err = {
      status: 500,
      message: "Login failed",
      extraDetails: error.message,
    };
    return next(err);
  }
};

export const logout = (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    // return res.json({success: false, message: error.message})
    console.error(error);
    const err = {
      status: 500,
      message: "Logout failed",
      extraDetails: error.message,
    };
    return next(err);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    // return res.json({success: false, message: error.message})
    const err = {
      status: 500,
      message: "Authentication failed",
      extraDetails: error.message,
    };
    return next(err);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        // avatar: user.avatar
      },
    });
  } catch (error) {
    // return res.json({success: false, message: error.message})
    console.error(error);
    const err = {
      status: 500,
      message: "Failed getting data",
      extraDetails: error.message,
    };
    return next(err);
  }
};

export const sendResetOtp = async(req, res, next)=>{
  const {email} = req.body;
  if(!email){ 
    return res.status(422).json({success: false, message: "Email is required"})
  }
  try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.status(404).json({success: false, message: "User not found"})
    }
    const otp = Math.floor(100000 + Math.random() * 900000); 
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; 
    await user.save(); 
    
    sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`)
    .then(() => console.log('Email sent successfully'))
    .catch(err => console.error('Error sending email:', err))
    return res.status(200).json({success: true, message: "OTP sent to email"})

  } catch (error) {
     console.error(error);
    const err = {
      status: 500,
      message: "Failed getting data",
      extraDetails: error.message,
    };
    return next(err);
  }
}

export const verifyOtp = async(req, res, next)=>{
  try {
    const {email, otp} = req.body;
    if(!email || !otp){
      return res.status(422).json({success: false, message: "Otp is required"})
    }
    const user = await userModel.findOne({email})
    if(!user){
      return res.status(404).json({success: false, message: "User not found"})
    }
    if(user.resetOtp !== otp || Date.now() > user.resetOtpExpiry){
      return res.status(400).json({success: false, message: "Invalid or expired OTP"})
    }
    return res.status(200).json({
      success: true,
       message: "OTP verified successfully",
      userId: user._id
      })
  } catch (error) {
    console.error(error);
    const err = {
      status: 500,
      message: "Failed getting data",
      extraDetails: error.message,
    };
    return next(err);
  }
}

export const resetPassword = async(req, res, next)=>{
  try {
    const {userId, newPassword} = req.body;
    if(!userId  || !newPassword){
      return res.status(422).json({success: false, message: "All fields are required"})
    }
    const user = await userModel.findById(userId)
    if(!user){
      return res.status(404).json({success: false, message: "User not found"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiry = 0;
    await user.save();
    return res.status(200).json({success: true, message: "Password reset successful"})
    
  } catch (error) {
     console.error(error);
    const err = {
      status: 500,
      message: "Failed getting data",
      extraDetails: error.message,
    };
    return next(err);
  }
}