import { IAdminService } from "../interface/IAdminService";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { ICreatorRepository } from "../../repositories/interface/ICreatorRepository";
import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdmin } from "../../models/Admin";
import { ICreator } from "../../models/Creator";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ISubscription } from "../../models/Subscription";
  import { sendMail } from "../../utils/mailer";


export default class AdminService implements IAdminService {
  private userRepository: IUserRepository;
  private creatorRepository: ICreatorRepository;
  private adminRepository: IAdminRepository;

  constructor(
    userRepository: IUserRepository,
    creatorRepository: ICreatorRepository,
    adminRepository: IAdminRepository
  ) {
    this.userRepository = userRepository;
    this.creatorRepository = creatorRepository;
    this.adminRepository = adminRepository;
  }


  //admin service

  async getDashboardData() {
    const userCount = await this.userRepository.countUsers();
    const creatorCount = await this.creatorRepository.countCreators();
    const pendingApprovals = await this.creatorRepository.countPendings();
    const totalEarnings = await this.creatorRepository.countPendings();

    return { userCount, creatorCount,pendingApprovals };
  }

  async handleCreatorReapply(creatorId: string): Promise<any> {
    return await this.adminRepository.updateCreatorStatusToPending(creatorId);
  }


  async getSubscriptionPlan(): Promise<ISubscription[]> {
    return await this.adminRepository.getFixedSubscriptionPlan();
  }

   async createSubscription(subscriptionData: any) {
    return this.adminRepository.create(subscriptionData);
  }

  async deleteSubscription  (id: string)  {
  return this.adminRepository.deleteSubscription(id);
};


  async getPendingCreators(): Promise<ICreator[]> {
    return await this.creatorRepository.findPendingCreators();
  }


async approveCreator(creatorId: string): Promise<ICreator | null> {
  const creator = await this.creatorRepository.approveCreator(creatorId);
  if (creator) {
    const subject = "Your Creator Account Has Been Approved!";
    const message = `Hello ${creator.name},\n\nYour request to become a creator has been approved.\n\nYou may now log in and start creating events!\n\nThank you,\nFestivia Team`;
    
    await sendMail(creator.email, subject, message);
  }
  return creator;
}


async rejectCreator(creatorId: string, rejectionReason: string): Promise<ICreator | null> {
  const creator = await this.creatorRepository.rejectCreator(creatorId, rejectionReason);
  if (creator) {
    const subject = "Your Creator Account Has Been Rejected";
    const message = `Hello ${creator.name},\n\nWe regret to inform you that your request to become a creator was rejected.\n\nReason: ${rejectionReason}\n\nIf
     you believe this was a mistake or have questions, please contact us.\n\nThank you,\nFestivia Team`;

    await sendMail(creator.email, subject, message);
  }
  return creator;
}


  async getCreatorStatus(creatorId: string): Promise<ICreator | null> {
    try {
      const creator = await this.creatorRepository.getCreatorStatus(creatorId);
      return creator;
    } catch (error) {
      throw new Error("Error fetching creator status in service");
    }
  }



  async refreshToken(refreshToken: string): Promise<string | null> {
    if (!refreshToken) {
      console.log("❌ No refresh token found");
      return null;
    }

    const admin = await this.adminRepository.findByRefreshToken(refreshToken);
    if (!admin) {
      console.log("❌ Refresh token not found in database");
      return null;
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;

      if (!decoded || typeof decoded !== "object") {
        throw new Error("Invalid token payload");
      }

      const adminId = decoded.id as string | undefined;

      if (!adminId) {
        throw new Error("Invalid token payload (missing ID)");
      }

      const newAccessToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET!, { expiresIn: "1h" });

      return newAccessToken;
    } catch (error) {
      console.log("❌ Invalid or expired refresh token");
      await this.adminRepository.updateRefreshToken(admin._id.toString(), "");
      return null;
    }
  }


  async login(username: string, password: string): Promise<{
    token: string;
    refreshToken: string;
    admin: { _id: string; username: string }
  }> {
    console.log("🛠️ Login attempt for username:", username);

    const admin: IAdmin | null = await this.adminRepository.findByUsername(username);
    if (!admin) {
      console.log("❌ Admin not found for username:", username);
      throw new Error("Invalid credentials");
    }

    console.log("✅ Admin found:", admin.username);

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password attempt for username:", username);
      throw new Error("Invalid credentials");
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error("❌ Missing JWT secret keys!");
      throw new Error("Server Error: Missing JWT secrets");
    }

    const adminId: string = admin._id.toString();

    const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: adminId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "15d" });

    console.log("🔑 Generated JWT Token:", token);
    console.log("🔄 Generated Refresh Token:", refreshToken);

    await this.adminRepository.updateRefreshToken(adminId, refreshToken);
    console.log("💾 Refresh Token Updated");

    return {
      token,
      refreshToken,
      admin: { _id: adminId, username: admin.username }
    };
  }




  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      console.log("❌ No refresh token found");
      return;
    }

    const admin = await this.adminRepository.findByRefreshToken(refreshToken);
    if (!admin) {
      console.log("❌ Refresh token not found in database");
      return;
    }

    await this.adminRepository.clearRefreshToken(admin._id.toString());
  }

  //AdminService
  async getUsers(): Promise<any> {
    return await this.userRepository.findAll();
  }

  async getCreators(): Promise<any> {
    return await this.creatorRepository.findAll();
  }

  async blockUser(userId: string): Promise<any> {
    return await this.userRepository.toggleBlock(userId);
  }

  async blockCreator(creatorId: string): Promise<any> {
    return await this.creatorRepository.toggleBlock(creatorId);
  }



}
