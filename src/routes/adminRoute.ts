import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import AdminService from "../services/implementation/AdminService";
import UserRepository from "../repositories/implementation/UserRepository";
import CreatorRepository from "../repositories/implementation/CreatorRepository";
import AdminRepository from "../repositories/implementation/AdminRepository";
import { authenticateToken } from "../middleware/admin/authMiddleware";
import EventController from "../controllers/implementation/EventController";
import { SubscriptionController } from "../controllers/implementation/SubscriptionController";

const router = Router();
const adminService = new AdminService(UserRepository,CreatorRepository,AdminRepository); 
const adminController = new AdminController(adminService); 
const eventController=new EventController()
const subscriptionController=new SubscriptionController()




router.get('/dashboard', adminController.getDashboardData.bind(adminController));
router.get('/subscriptions-history', subscriptionController.getSubscriptionHistory.bind(subscriptionController));
router.get('/all-subscriptions', adminController.getSubscriptionPlan.bind(adminController));
router.post('/create-subscription', adminController.createSubscription.bind(adminController));
router.delete('/delete-subscription/:id', adminController.deleteSubscription.bind(adminController));
router.get("/pending-creators", adminController.getPendingCreators.bind(adminController));
router.put("/approve-creator/:creatorId", adminController.approveCreator.bind(adminController));
router.put("/reject-creator/:creatorId", adminController.rejectCreator.bind(adminController));
router.get("/creator-status/:creatorId", adminController.getCreatorStatus.bind(adminController));
router.put('/creator-reapply/:id', adminController.reapplyCreator.bind(adminController));
router.get('/public-events', eventController.getAllEvents.bind(eventController));
router.post("/login", adminController.login.bind(adminController));
router.get("/users", adminController.getUsers.bind(adminController));
router.get("/creator", adminController.getCreators.bind(adminController));
router.put("/toggle-block/:userId",authenticateToken, adminController.blockUser.bind(adminController));
router.put("/toggle-block-creator/:creatorId",authenticateToken,adminController.blockCreator.bind(adminController));
router.post("/logout", adminController.logout.bind(adminController));




export default router;
