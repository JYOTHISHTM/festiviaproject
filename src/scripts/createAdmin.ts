import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AdminModel } from "../models/Admin"; 

const MONGO_URI = "mongodb://localhost:27017/festivia"; 

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await AdminModel.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists!");
      mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash("admin@123", 10);

    const newAdmin = new AdminModel({
      username: "admin",
      password: hashedPassword,
      isAdmin: true,
    });

    await newAdmin.save();
    console.log("Admin created successfully!");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin:", error);
    mongoose.disconnect();
  }
}

createAdmin();
