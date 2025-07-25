import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../../repositories/implementation/UserRepository";
import CreatorRepository from "../../repositories/implementation/CreatorRepository";
import AuthRepository from "../../repositories/implementation/AuthRepository";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import OTP from "../../models/Otp";
import dotenv from "dotenv";
import { sendMail } from "../../utils/mailer";

import { IUser } from "../../models/User";  // make sure this is the correct path





dotenv.config();
class AuthService {


  private transporter;


  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
    rejectUnauthorized: false,
  },
    });
  }





 async login(email: string, password: string, role: "user" | "creator") {
  const repository = role === "user" ? UserRepository : CreatorRepository;
  const user = await repository.findByEmail(email);
  
  if (!user) {
    return { status: "error", message: "Invalid credentials" };
  }
  
  if (user.isBlocked) {
    console.log("🚫 Blocked account attempted login:", user.email);
    throw new Error("Your account has been blocked.");
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log("❌ Invalid password attempt");
    return { status: "error", message: "Invalid credentials" };
  }

 if (role === "creator") {
  switch (user.status) {
    case "pending":
      return {
        status: "pending",
        message: "Your creator account is pending approval.",
        user: { id: user._id }
      };
    case "rejected":
      return {
        status: "rejected",
        message: user.rejectionReason || "Your account has been rejected.",
        user: { id: user._id }
      };
    case "approved":
      break; 
    default:
      return {
        status: "error",
        message: "Unknown creator status."
      };
  }
}

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "15d" });
  await repository.updateRefreshToken(user._id, refreshToken);

  return {
    status: "approved",
    token,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      status: user.status
    }
  };
}


  private async sendOTP(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });
  }

 

  async register(name: string, email: string, password: string, role: "user" | "creator") {
    const repository = role === "user" ? UserRepository : CreatorRepository;
    const existingUser = await repository.findByEmail(email);
  
    if (existingUser) throw new Error("Email already in use");
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 1000);
  
    await OTP.create({ email, otp, expiresAt });
    await this.sendOTP(email, otp);
  
    const data: any = {
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    };
  
    if (role === "creator") {
      data.isAdminApproved = false;
    }
  
    await repository.create(data);
  
    return { email, message: "OTP sent", role };
  }
  


  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async verifyOTP(email: string, otp: string, userType: "user" | "creator") {
    const repository = userType === "user" ? UserRepository : CreatorRepository;

    const user = await repository.findOne({ email });
    if (!user) throw new Error(`${userType} not found`);

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) throw new Error("Invalid OTP");

    if (otpRecord.expiresAt && otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email });
      throw new Error("OTP expired, request a new one");
    }

    user.isVerified = true;
    await user.save();
    await OTP.deleteOne({ email });

    return { email, message: `${userType} account verified` };
  }

  async logoutUser(userId: string): Promise<void> {
    await AuthRepository.clearUserRefreshToken(userId);
  }

  async logoutCreator(creatorId: string): Promise<void> {
    await AuthRepository.clearCreatorRefreshToken(creatorId);
  }

  async logout(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }

    const userId = decoded.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid User ID");
    }

    await AuthRepository.clearUserRefreshToken(userId);
    return "Logged out successfully";
  }

  async resendOTP(email: string, type: "user" | "creator"): Promise<{ message: string }> {
    const userOrCreator = await AuthRepository.findByEmail(email, type);
    if (!userOrCreator) {
      throw new Error(`${type === "user" ? "User" : "Creator"} not found`);
    }

    await AuthRepository.deleteOTP(email);

    const newOtp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await AuthRepository.saveOTP(email, newOtp, expiresAt);
    await this.sendOTP(email, newOtp);

    return { message: "New OTP sent successfully" };
  }

  async refreshAccessToken(refreshToken: string, type: "user" | "creator"): Promise<string | null> {
    if (!refreshToken) {
      console.log("❌ No refresh token provided");
      return null;
    }

    const user = await AuthRepository.findByRefreshToken(refreshToken, type);
    if (!user) {
      console.log("❌ Refresh token not found in database");
      return null;
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

      return newAccessToken;
    } catch (error) {
      console.log("❌ Invalid or expired refresh token");
      const user = await AuthRepository.findByRefreshToken(refreshToken, type);
      return null;
    }
  }

  async sendOtp(email: string, type: "user" | "creator"): Promise<{ message: string; otp: string }> {
    const found = await AuthRepository.findUserByEmail(email, type);
    if (!found) throw new Error("User not found");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", otp);

    await AuthRepository.saveOtpToUser(email, otp, type);
    await sendMail(email, "Your OTP", `Your OTP code is ${otp}`);

    return { message: "OTP sent to email", otp };
  }

  async verifyOtp(email: string, otp: string, type: "user" | "creator"): Promise<boolean> {
    const record = await AuthRepository.findByEmail(email, type)

    if (!record || record.otp !== otp) {
      return false;
    }

    return true;
  }

  async resetPassword(email: string, newPassword: string, type: "user" | "creator"): Promise<string> {
    const user = await AuthRepository.findUserByEmail(email, type);
    if (!user) throw new Error("User not found");

    const hashed = await bcrypt.hash(newPassword, 10);
    await AuthRepository.updatePasswordByType(email, hashed, type);

    return "Password updated successfully";
  }



async findOrCreate(profile: any): Promise<IUser | null> {
    let user = await AuthRepository.findByGoogleId(profile.id)
    if (!user) {
      user = await AuthRepository.createUser({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      })
    }
    return user
  }
}


export default new AuthService();
