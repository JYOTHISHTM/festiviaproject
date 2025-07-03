import UserModel, { IUser } from "../../models/User";
import CreatorModel, { ICreator } from "../../models/Creator";
import { UpdateQuery } from "mongoose";

import CreatorRepository from "../../repositories/implementation/CreatorRepository";
import UserRepository from "../../repositories/implementation/UserRepository";

class ProfileRepository {
  public async updateProfile(
    profileType: "user" | "creator",
    profileId: string,
    updatedData: UpdateQuery<IUser | ICreator>
  ): Promise<IUser | ICreator | null> {
    try {
      let result = null;

      if (profileType === "user") {
        result = await UserModel.findByIdAndUpdate(profileId, updatedData, {
          new: true,
          runValidators: true,
        });
      } else if (profileType === "creator") {
        result = await CreatorModel.findByIdAndUpdate(profileId, updatedData, {
          new: true,
          runValidators: true,
        });
      }



      
      if (!result) {
        console.log(`❌ No ${profileType} found to update`);
      } else {
        console.log("✅ Database update successful:", result);
      }

      return result;
    } catch (error: any) {
      console.error("❌ Repository error:", error.message);
      throw error;
    }
  }

  public async findById(id: string, type: "creator" | "user"): Promise<ICreator | IUser | null> {
    return type === "creator" ? await CreatorRepository.findById(id) : await UserRepository.findById(id);
  }

}

export default new ProfileRepository();
