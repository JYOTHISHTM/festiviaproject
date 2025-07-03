import { Request, Response, NextFunction } from "express";
import CreatorModel from "../../models/Creator"; 
import { StatusCodes } from "../../enums/StatusCodes";

interface AuthenticatedRequest extends Request {
  creator?: { id: string }; 
}

const checkBlocked = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      console.log("🔹 checkBlocked Middleware Running..."); 

  try {
    if (!req.creator || !req.creator.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const creator = await CreatorModel.findById(req.creator.id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    if (creator.isBlocked) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Your account has been blocked." });
    }

    next(); 
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

export default checkBlocked;
