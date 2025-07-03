import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/User"; 
import { StatusCodes } from "../../enums/StatusCodes";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const checkBlocked = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      console.log("🔹 checkBlocked Middleware Running...");
  try {
    if (!req.user || !req.user.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });

    if (user.isBlocked) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Your account has been blocked." });
    }

    next(); 
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

export default checkBlocked;
