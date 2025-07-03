import { Request, Response } from "express";
import { ICreatorController } from "../interface/ICreatorController";
import CreatorService from "../../services/implementation/CreatorService";
import cloudinary from "../../config/cloudinary";
import streamifier from "streamifier"
import SeatLayoutModel from "../../models/SeatLayoutModel";
import mongoose from "mongoose";
import { StatusCodes } from "../../enums/StatusCodes";



interface AuthRequest extends Request {
  creator?: { id: string };
}

class CreatorController implements ICreatorController {

  async getReservedEvents(req: Request, res: Response) {
    try {
      const { layoutId } = req.params;
      const { creatorId } = req.query;

      if (!creatorId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing creatorId' });
      }

      const events = await CreatorService.getReservedEventsByCreator(layoutId);
      return res.status(StatusCodes.OK).json(events);
    } catch (error) {
      console.error("Server error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch events', error: error instanceof Error ? error.message : error });
    }
  }



  async getCreator(req: Request, res: Response): Promise<Response> {
    try {

      const creatorId = (req as any).creator?.id;
      if (!creatorId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      }

      const creator = await CreatorService.getCreator(creatorId);
      if (!creator) return res.sendStatus(404);

      return res.json(creator);
    } catch (error: any) {
      console.error("❌ Get creator error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
  }


  async createEvent(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Image file is required." });
      }

      const streamUpload = () => {
        return new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "festivia/events" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          if (req.file) {
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          }
        });
      };

      const uploadResult = await streamUpload();
      const imageUrl = uploadResult.secure_url;

      const {
        eventName,
        eventType,
        description,
        date,
        startDate,
        endDate,
        daySelectionMode,
        time,
        location,
        seatType,
        price,
        layoutId

      } = req.body;
      let geoLocation;
      try {
        geoLocation = JSON.parse(req.body.geoLocation);
        if (
          !geoLocation ||
          geoLocation.type !== 'Point' ||
          !Array.isArray(geoLocation.coordinates) ||
          geoLocation.coordinates.length !== 2
        ) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid geoLocation format" });
        }
      } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid geoLocation JSON" });
      }



      if (!eventName || !eventType || !description || !daySelectionMode || !time || !location || !seatType) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "All required fields must be provided" });
      }

      if (seatType === "GENERAL") {
        if (!price || isNaN(parseFloat(price))) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Price is required and must be a valid number for GENERAL seat type" });
        }
      }
      if (daySelectionMode === 'single' && !date) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Date is required for single day mode" });
      }

      if (daySelectionMode === 'range' && (!startDate || !endDate)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Start and end dates are required for range mode" });
      }

      const creatorId = (req as any).creator?.id;
      console.log("creator id in Controller", creatorId);

      if (!creatorId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: Creator ID not found" });
      }

      const eventData: any = {
        eventName,
        eventType,
        description,
        daySelectionMode,
        time,
        location,
        seatType,
        image: imageUrl,
        creatorId: creatorId

      };
      eventData.geoLocation = geoLocation;

      if (seatType === "GENERAL") {
        eventData.price = parseFloat(price);
      }

      if (daySelectionMode === 'single') {
        eventData.date = date;
      } else if (daySelectionMode === 'range') {
        eventData.startDate = startDate;
        eventData.endDate = endDate;
      }

      if (seatType === "RESERVED") {
        let layoutIdValue: string;

        if (Array.isArray(layoutId)) {
          layoutIdValue = layoutId.find(id => id.trim() !== '');
        } else {
          layoutIdValue = layoutId;
        }

        if (!layoutIdValue || !mongoose.Types.ObjectId.isValid(layoutIdValue)) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid layout ID" });
        }

        const layout = await SeatLayoutModel.findById(layoutIdValue);
        console.log("lay out find in model here  ", layout);

        if (!layout) {
          return res.status(StatusCodes.NOT_FOUND).json({ message: "Seat layout not found" });
        }

        if (layout.isUsed) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: "This layout is already used by another event" });
        }

        layout.isUsed = true;
        await layout.save();

        eventData.layoutId = layoutIdValue;
      }



      const newEvent = await CreatorService.createEvent(eventData);


      return res.status(StatusCodes.CREATED).json(newEvent);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create event", error });
    }
  }

}

export default CreatorController;



