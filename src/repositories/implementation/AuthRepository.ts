import UserModel, { IUser } from "../../models/User";
import CreatorModel from "../../models/Creator";
import OTPModel from "../../models/Otp";

class AuthRepository {


  async clearUserRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: "" });
  }

  async clearCreatorRefreshToken(creatorId: string): Promise<void> {
    await CreatorModel.findByIdAndUpdate(creatorId, { refreshToken: "" });
  }



  async deleteOTP(email: string): Promise<void> {
    await OTPModel.deleteOne({ email });
  }

  async saveOTP(email: string, otp: string, expiresAt: Date) {
    await OTPModel.create({ email, otp, expiresAt });
  }

  async updateRefreshToken(userId: string, refreshToken: string, type: "user" | "creator") {
    if (type === "user") {
      return await UserModel.findByIdAndUpdate(userId, { refreshToken });
    } else {
      return await CreatorModel.findByIdAndUpdate(userId, { refreshToken });
    }
  }

  async findByRefreshToken(refreshToken: string, type: "user" | "creator") {
    return type === "user"
      ? await UserModel.findOne({ refreshToken })
      : await CreatorModel.findOne({ refreshToken });
  }

  async clearRefreshToken(userId: string, type: "user" | "creator") {
    if (type === "user") {
      await UserModel.findByIdAndUpdate(userId, { refreshToken: "" });
    } else {
      await CreatorModel.findByIdAndUpdate(userId, { refreshToken: "" });
    }
  }


  async saveOtpToUser(email: string, otp: string, type: "user" | "creator") {
    if (type === "user") {
      return await UserModel.updateOne({ email }, { $set: { otp } });
    } else {
      return await CreatorModel.updateOne({ email }, { $set: { otp } });
    }
  }

  async deleteByEmail(email: string, type: "user" | "creator") {
    return type === "user"
      ? await UserModel.deleteOne({ email: new RegExp(`^${email}$`, 'i') })
      : await CreatorModel.deleteOne({ email: new RegExp(`^${email}$`, 'i') });
  }

  async findUserByEmail(email: string, type: string) {
    if (type === "user") {
      return await UserModel.findOne({ email });
    } else if (type === "creator") {
      return await CreatorModel.findOne({ email });
    } else {
      throw new Error("Invalid type");
    }
  }

  async updatePasswordByType(email: string, hashedPassword: string, type: "user" | "creator") {
    if (type === "user") {
      return UserModel.updateOne({ email }, { $set: { password: hashedPassword } });
    } else {
      return CreatorModel.updateOne({ email }, { $set: { password: hashedPassword } });
    }
  }


  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await UserModel.findOne({ googleId })
  }
  
  async findByEmail(email: string,type:string) {
    return await UserModel.findOne({ email });
  }

  async createUser(data: any) {
    return await UserModel.create(data);
  }


}

export default new AuthRepository();
