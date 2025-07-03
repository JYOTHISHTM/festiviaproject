// src/services/ProfileService.ts
import ProfileRepository from "../../repositories/implementation/ProfileRepository";
import { IUser } from "../../models/User";
import { ICreator } from "../../models/Creator";
import { IProfileService } from "../interface/IProfileService";
import bcrypt from 'bcrypt' 

class ProfileService implements IProfileService {



  public async updateProfile(
    profileType: "user" | "creator",
    profileId: string,
    profileData: Partial<IUser | ICreator>
  ): Promise<IUser | ICreator | null> {
    try {
      console.log(`📡 Service: Updating ${profileType} profile for ID:`, profileId);
      console.log("📝 Data being sent to repository:", JSON.stringify(profileData, null, 2));

      return await ProfileRepository.updateProfile(profileType, profileId, profileData);
    } catch (error: any) {
      console.error("❌ Service Error:", error.message);
      throw new Error(error.message);
    }
  }

  public async getProfileById(
    id: string,
    type: "creator" | "user"
  ): Promise<ICreator | IUser | null> {
    return await ProfileRepository.findById(id, type);
  }
}

export default new ProfileService();
