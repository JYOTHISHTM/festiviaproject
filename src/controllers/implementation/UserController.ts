import { Request, Response } from "express";
import { IUserController } from "../interface/IUserController";
import { IUserService } from "../../services/interface/IUserService";
import UserService from "../../services/implementation/UserService";
import User from "../../models/User";
import { StatusCodes } from "../../enums/StatusCodes";
import { userDTO } from "../../dto/userProfileDto"; 

interface AuthRequest extends Request {
  user?: { id: string };
}
class UserController implements IUserController {

  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }


  async getUser(req: Request, res: Response) {
    try {
      const user = await User.findById((req as any).user.id).select("-password");
      if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);
      const safeUser = userDTO(user);
      // res.json(user);
      res.json(safeUser);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
  };



async getUserTickets(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 4;

    const result = await UserService.getTicketsByUserId(userId, page, limit);
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

  async cancelUserTicket(req: Request, res: Response) {
    try {
      const { userId, ticketId } = req.params;

      const result = await UserService.cancelTicketAndRefund(ticketId, userId);

      res.json({ message: `Ticket cancelled. ₹${result.refundAmount} refunded to your wallet.` });
    } catch (error: any) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }

async getLayoutAndEvent(req: Request, res: Response) {
    try {
      const { layoutId } = req.params;
      const data = await UserService.fetchLayoutAndEvent(layoutId);
      res.json(data);
    } catch (error: any) {
      res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
    }
  }

}


const userController = new UserController(UserService);
export default userController;
