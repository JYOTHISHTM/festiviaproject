import { Request, Response } from 'express';
import { PasswordRepository } from '../../repositories/implementation/PasswordRepository';
import { PasswordService } from '../../services/implementation/PasswordService';
import { StatusCodes } from "../../enums/StatusCodes";

const passwordRepo = new PasswordRepository();
const passwordService = new PasswordService(passwordRepo);

interface User {
  id: string;
}

declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}



class PasswordController {
  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      console.log("📦 Request body received:", { currentPassword: "***", newPassword: "***" });

      const userId = (req.user as any)?.id;
      if (!userId) {
        console.log(" User ID not found in request");
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      }

      console.log(" Calling password service with userId:", userId);
      await passwordService.changePassword(userId, currentPassword, newPassword);
      console.log("Password successfully changed");

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          message: 'Password changed successfully',
        }
      })
    } catch (error: any) {
      console.error(" Password change error:", error);
      console.error(" Error stack:", error.stack);
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }


}

export default PasswordController