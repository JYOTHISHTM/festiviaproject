
import CreatorController from "../controllers/implementation/CreatorController";
import AuthController from "../controllers/implementation/AuthController";
import ProfileController from "../controllers/implementation/ProfileController";
import EventController from "../controllers/implementation/EventController";
import { authenticateToken } from "../middleware/creator/authMiddleware";
import EventProfileController from "../controllers/implementation/EventProfileController";
import checkBlocked from "../middleware/creator/checkBlocked";
import express from "express";
import { PostUpload } from "../middleware/creator/PostUpload";
import { ChatController } from "../controllers/implementation/ChatController";
import { SubscriptionController } from '../controllers/implementation/SubscriptionController'
import dotenv from 'dotenv';
import TicketController from "../controllers/implementation/TicketController";
import WalletController from "../controllers/implementation/WalletController";
import { SeatLayoutController } from "../controllers/implementation/SeatLayoutController";
import { SeatLayoutService } from "../services/implementation/SeatLayoutService";
import { SeatLayoutRepository } from "../repositories/implementation/SeatLayoutRepository";
import cloudinary from '../config/cloudinary'; 
import multer from 'multer';
import { Readable } from 'stream';


dotenv.config();

const router = express.Router();
const authController = new AuthController();
const creatorController = new CreatorController();
const eventController = new EventController();
const profileController = new ProfileController();
const eventProfileController = new EventProfileController();
const chatController = new ChatController()
const subscriptionController = new SubscriptionController()
const walletController = new WalletController()
const layoutRepo = new SeatLayoutRepository();
const layoutService = new SeatLayoutService(layoutRepo);
const seatLayoutController = new SeatLayoutController(layoutService);


const storage = multer.memoryStorage();
const upload = multer({ storage });



router.get('/layout/:layoutId', creatorController.getReservedEvents.bind(creatorController));




router.get("/event/:id", eventController.getEventById.bind(eventController));

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log("Uploading file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const streamUpload = (buffer: Buffer): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: 'chat_media',
            resource_type: 'auto' 
          },
          (error, result) => {
            if (result) {
              console.log("Cloudinary upload successful:", result.secure_url);
              resolve(result);
            } else {
              console.error("Cloudinary upload error:", error);
              reject(error);
            }
          }
        );
        
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 
                 req.file.mimetype.startsWith('video/') ? 'video' : 'file',
      mediaName: req.file.originalname,
      mediaSize: req.file.size
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ 
      error: 'Failed to upload file to Cloudinary',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});


router.get('/layouts', seatLayoutController.getLayouts);
router.post('/layouts/:creatorId', seatLayoutController.createLayout);
router.get('/check-layouts/:creatorId', seatLayoutController.getLayoutsByCreatorId);


router.post('/create-event', authenticateToken, upload.single('image'), creatorController.createEvent.bind(creatorController));








router.get('/wallet/:creatorId', walletController.getWalletForCreator.bind(walletController));
router.post('/wallet/add', walletController.addMoneyToCreator.bind(walletController));
router.post('/wallet/checkout-session', walletController.createCheckoutSessionForCreator.bind(walletController));

router.get("/ticket-summary", TicketController.getTicketSummary)
router.get('/ticket-users', TicketController.getUsersWhoBoughtTickets);

router.patch('/update-description/:id', eventController.updateDescription.bind(eventController));

router.get("/chat/:roomId", chatController.getChatHistoryForCreator.bind(chatController));
router.get("/chat/creator/:creatorId", chatController.getChatsForCreator.bind(chatController));

router.get('/:creatorId/messages/users', chatController.getUsersWhoMessagedCreator.bind(chatController));
router.patch('/cancel-subscription/:creatorId', subscriptionController.expireSubscription.bind(subscriptionController))



router.get('/subscription-history', authenticateToken, subscriptionController.getCreatorHistory.bind(subscriptionController));




router.post('/buy-using-wallet', authenticateToken, subscriptionController.buyUsingWallet.bind(subscriptionController));



router.get('/subscription', authenticateToken, subscriptionController.getCreatorSubscription.bind(subscriptionController));
router.get('/all-subscriptions', subscriptionController.getAllSubscriptionPlan.bind(subscriptionController));



router.post('/buy-subscription', subscriptionController.createSubscriptionCheckout.bind(subscriptionController));





router.patch('/toggle-list/:eventId', eventController.toggleListStatus.bind(eventController));

router.get('/post-details/:id', eventProfileController.getPostDetails.bind(eventProfileController));

router.get("/event-profile-info", eventProfileController.getProfileInfo.bind(eventProfileController));
router.get("/all-posts", eventProfileController.getAllPost.bind(eventProfileController));

router.post("/update-event-profile", eventProfileController.updateProfileInfo.bind(eventProfileController));


router.post(
  "/update-profile-image",
  upload.single("profileImage"),
  eventProfileController.updateProfileImage.bind(eventProfileController)
);


router.post(
  "/create",
  PostUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 4 },
  ]),
  eventProfileController.PostEvent.bind(eventProfileController)
);







//AuthController
router.post("/sign-up", authController.signUp.bind(authController));
router.post("/verify-otp", authController.verifyOTP.bind(authController));
router.post("/resend-otp", authController.resendOTP.bind(authController));
router.post("/login", (req, res) => authController.login(req, res))
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/logout", (req, res) => authController.logout(req, res));


//EventController
router.get("/events", eventController.getAllEvents.bind(eventController));
router.get('/all-listed-events/:creatorId', eventController.getAllListedEvents.bind(eventController));


//CreatorController


router.get("/me", (req, res) => creatorController.getCreator.bind(creatorController));



//ProfileController
router.get("/profile-data", authenticateToken, checkBlocked, profileController.getProfile.bind(profileController));
router.put("/update-profile", authenticateToken, checkBlocked, profileController.updateProfile.bind(profileController));





router.post("/send-otp", authController.sendOtp.bind(authController));
router.post("/verify-otp-forgot-password", authController.verifyOtp.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));



export default router;
