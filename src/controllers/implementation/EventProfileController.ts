import { Request, Response } from "express";
import * as service from "../../services/implementation/EventProfileService";
import { uploadToCloudinary } from "../../middleware/creator/ProfileImage";
import { StatusCodes } from "../../enums/StatusCodes";
import { IEventProfileController } from "../interface/IEventProfileController";
import { eventProfileDTO } from "../../dto/eventProfileDto";

class EventProfileController implements IEventProfileController {

  async PostEvent(req: Request, res: Response): Promise<Response> {
    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const mainImage = files["mainImage"]?.[0]?.path;
      if (!mainImage) {
        console.warn("❗ Main image is required but missing.");
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Main image is required." });
      }

      const additionalImages = (files["additionalImages"] || []).map(file => file.path);

      if (additionalImages.length > 0) {
        console.log(`📸 ${additionalImages.length} additional image(s) uploaded.`);
      } else {
        console.log("ℹ️ No additional images uploaded.");
      }

      const totalTicketsSold = parseInt(req.body.totalTicketsSold) || 0;
      const totalRevenue = parseFloat(req.body.totalRevenue) || 0;

      console.log("🎟️ Total Tickets Sold:", totalTicketsSold);
      console.log("💰 Total Revenue:", totalRevenue);

      const eventData = {
        ...req.body,
        totalTicketsSold,
        totalRevenue,
        creator: req.body.creator,
        mainImage,
        additionalImages,
      };

      console.log("🔍 Creating event with data:", {
        ...eventData,
        description: eventData.description?.slice(0, 30) + "...",
      });

      const created = await service.postEvent(eventData);

      console.log("✅ Event created successfully:", created);

      return res.status(StatusCodes.CREATED).json(created);
    } catch (err) {
      console.error("❌ Event creation failed:", err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Event creation failed." });
    }
  }

  async getPostDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;
      const event = await service.findByIdService(eventId);

      if (!event) {
        console.warn("⚠️ No event found with that ID!");
        res.status(StatusCodes.NOT_FOUND).json({ error: "Event not found" });
        return;
      }

      res.status(StatusCodes.OK).json(event);
    } catch (error) {
      console.error("❌ Error fetching event details:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Something went wrong" });
    }
  }

  async getAllPost(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = req.query.creatorId as string;

      if (!creatorId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing creatorId" });
        return;
      }

      const events = await service.getAllPost(creatorId);
      res.status(StatusCodes.OK).json(events);
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch events." });
    }
  }

  async getAllPrivateCreatorsProfile(_req: Request, res: Response): Promise<void> {
    try {
      const profile = await service.getAllPrivateCreatorsData();
 const safeProfiles = profile.map(eventProfileDTO);
      res.json(safeProfiles);
        } catch (error) {
      console.error("❌ Error getting profile info:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to get profile info" });
    }
  }

  async updateProfileImage(req: Request, res: Response): Promise<Response> {
    try {
      const file = req.file;
      const creatorId = req.body.creatorId;

      if (!file || !creatorId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing image or creator ID" });
      }

      const imageUrl = await uploadToCloudinary(file.buffer);
      const updated = await service.updateProfile("profileImage", imageUrl, creatorId);

      return res.json(updated);
    } catch (error) {
      console.error("❌ Failed to update profile image:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to update profile image" });
    }
  }

  async updateProfileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { field, value } = req.body;

      if (!field || value === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid data" });
        return;
      }

      const creatorId = req.body.creator?.id;
      const updated = await service.updateProfile(field, value, creatorId);

      res.json(updated);
    } catch (error) {
      console.error("❌ Error updating profile info:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to update profile info" });
    }
  }

  async getProfileInfo(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = req.query.creatorId as string;

      if (!creatorId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Creator ID is required" });
        return;
      }

      const profile = await service.getProfileData(creatorId);

      if (!profile) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Profile not found" });
        return;
      }

      res.json(profile);
    } catch (error) {
      console.error("❌ Error getting profile info:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to get profile info" });
    }
  }
}

export default EventProfileController;
