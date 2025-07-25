import { Request, Response } from "express";
import dotenv from "dotenv";
import { IAdminController } from "../../controllers/interface/IAdminController";
import { IAdminService } from "../../services/interface/IAdminService";
import { StatusCodes, Messages } from "../../enums/StatusCodes";
import { userDTO } from "../../dto/userDto";
import { creatorDTO } from "../../dto/creatorDto";

dotenv.config();

class AdminController implements IAdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }



  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.adminService.getDashboardData();
      res.json(data);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  };



  async reapplyCreator(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = req.params.id;

      const result = await this.adminService.handleCreatorReapply(creatorId);

      if (!result) {
        res.status(StatusCodes.NOT_FOUND).json({ message: Messages.CREATOR_NOT_FOUND });
      }

      res.status(StatusCodes.OK).json({ message: Messages.REAPPLIED_SUCCESSFULLY, creator: result });
    } catch (err) {
      console.error('Controller Error:', err);
      res.status(500).json({ message: Messages.INTERNAL_SERVER_ERROR });
    }
  }

  async getSubscriptionPlan(req: Request, res: Response): Promise<Response> {
    try {
      const plan = await this.adminService.getSubscriptionPlan();
      return res.status(StatusCodes.OK).json(plan);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching subscription plan' });
    }
  }

  async deleteSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.adminService.deleteSubscription(id);
      res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete subscription' });
    }
  };


  async createSubscription(req: Request, res: Response){
    try {
      const data = req.body;


      if (!data.name || !data.price || !data.days) {
        console.log(data.name);
        console.log(data.price);
        console.log(data.days);

        return res.status(400).json({ message: 'Missing required fields' });
      }

      const created = await this.adminService.createSubscription(data);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ message: 'Server error', err });
    }
  }

  async getPendingCreators(req: Request, res: Response) {
    try {
      console.log("Controller hit: fetching pending creators");
      const pendingCreators = await this.adminService.getPendingCreators();
      console.log("Found creators:", pendingCreators); // ✅
      return res.status(StatusCodes.OK).json(pendingCreators);
    } catch (error) {
      console.error("Backend error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching pending creators", error });
    }
  }

  async approveCreator(req: Request, res: Response) {
    try {
      const { creatorId } = req.params;

      const creator = await this.adminService.approveCreator(creatorId);

      if (!creator) return res.status(StatusCodes.NOT_FOUND).json({ message: "Creator not found" });

      return res.status(StatusCodes.OK).json({
        message: "Creator approved successfully",
        creator,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error approving creator", error });
    }
  }

  async rejectCreator(req: Request, res: Response) {
    try {
      const { creatorId } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Rejection reason is required" });
      }

      const creator = await this.adminService.rejectCreator(creatorId, rejectionReason);

      if (!creator) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Creator not found" });
      }

      return res.status(StatusCodes.OK).json({
        message: "Creator rejected successfully",
        creator
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error rejecting creator", error });
    }
  }

  async getCreatorStatus(req: Request, res: Response) {
    try {
      console.log("hit staus in controller");

      const { creatorId } = req.params;

      const creator = await this.adminService.getCreatorStatus(creatorId);

      if (!creator) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Creator not found" });
      }

      return res.status(StatusCodes.OK).json({
        status: creator.status,
        rejectionReason: creator.rejectionReason || null,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching creator status" });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;
      const { token, refreshToken, admin } = await this.adminService.login(username, password);

      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

      return res.status(StatusCodes.OK).json({
        message: "Login successful",
        isAdmin: true,
        token,
        admin: { id: admin._id, username: admin.username }
      });

    } catch (error) {
      console.error("❌ Server error:", (error as Error).message);
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: (error as Error).message });
    }
  }


  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;
      const newAccessToken = await this.adminService.refreshToken(refreshToken);

      if (!newAccessToken) {
        res.clearCookie("refreshToken");
        return res.status(StatusCodes.FORBIDDEN).json({ error: "Invalid or expired refresh token" });
      }

      res.json({ token: newAccessToken });
    } catch (error) {
      console.error("❌ Internal server error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
  }


  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.cookies;

      await this.adminService.logout(refreshToken);

      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });

      res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("❌ Logout error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server error" });
    }
  }

  // async getUsers(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const users = await this.adminService.getUsers();
  //     return res.status(StatusCodes.OK).json(users);
  //   } catch (error) {
  //     console.error("Actual Error in getUsers:", error);
  //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //       message: "Error fetching users",
  //       error,
  //     });
  //   }
  // }

  
async getUsers(req: Request, res: Response): Promise<Response> {
  try {
    const users = await this.adminService.getUsers();

    const safeUsers = users.map(userDTO); // ✅ mapping raw users to safe data

    return res.status(StatusCodes.OK).json(safeUsers);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Error fetching users",
      error,
    });
  }
}

 async getCreatorsbySearch(req: Request, res: Response) {
    try {
      const search = req.query.search?.toString() || "";
      const creators = await this.adminService.getCreatorsBySearch(search);
      res.status(200).json(creators);
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ error: "Failed to fetch creators" });
    }
  };

 async getUsersbySearch(req: Request, res: Response) {
    try {
      const search = req.query.search?.toString() || "";
      const users = await this.adminService.getUsersbySearch(search);
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ error: "Failed to fetch creators" });
    }
  };


  async getCreators(req: Request, res: Response): Promise<Response> {
    try {
      const creators = await this.adminService.getCreators();
      const safecreators = creators.map(creatorDTO); 
      return res.status(StatusCodes.OK).json(safecreators);
    } catch (error) {
      console.error("Actual Error in getCreators:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching creators",
        error,
      });
    }
  }

  

  async blockUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const user = await this.adminService.blockUser(userId);

      if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });

      return res.status(StatusCodes.OK).json({
        message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
        // user
         user: userDTO(user)
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating user status", error });
    }
  }

  async blockCreator(req: Request, res: Response): Promise<Response> {
    try {
      const { creatorId } = req.params;
      const creator = await this.adminService.blockCreator(creatorId);

      if (!creator) return res.status(StatusCodes.NOT_FOUND).json({ message: "Creator not found" });

      return res.status(StatusCodes.OK).json({
        message: creator.isBlocked ? "Creator blocked successfully" : "Creator unblocked successfully",
        // creator
           creator: creatorDTO(creator)
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating creator status", error });
    }
  }

}

export default AdminController;
