import { Request, Response } from "express";
import ProfileService from "../../services/implementation/ProfileService";
import { StatusCodes } from "../../enums/StatusCodes";
import { IUser } from "../../models/User";
import { ICreator } from "../../models/Creator";

class ProfileController {
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as Request & { user?: IUser; creator?: ICreator };

      let profileId = "";
      let profileType: "user" | "creator";

      if (authReq.user?.id) {
        profileId = authReq.user.id;
        profileType = "user";
      } else if (authReq.creator?.id) {
        profileId = authReq.creator.id;
        profileType = "creator";
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Profile ID not found" });
        return;
      }

      const updatedProfile = await ProfileService.updateProfile(profileType, profileId, req.body);

      if (!updatedProfile) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `${profileType} not found` });
        return;
      }

      res.json(updatedProfile);
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as Request & { user?: IUser; creator?: ICreator };

      const creatorId = authReq.creator?.id;
      const userId = authReq.user?.id;

      if (!creatorId && !userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const type = creatorId ? "creator" : "user";
      const id = creatorId || userId;

      const profile = await ProfileService.getProfileById(id, type);

      if (!profile) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `${type} not found` });
        return;
      }

      res.json(profile);
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching profile", error: error.message });
    }
  }
}

export default ProfileController;
