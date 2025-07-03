// src/services/interface/IProfileService.ts
import { IUser } from "../../models/User";
import { ICreator } from "../../models/Creator";

export interface IProfileService {
  updateProfile(
    profileType: "user" | "creator",
    profileId: string,
    profileData: Partial<IUser | ICreator>
  ): Promise<IUser | ICreator | null>;

  getProfileById(
    id: string,
    type: "creator" | "user"
  ): Promise<ICreator | IUser | null>;
}
