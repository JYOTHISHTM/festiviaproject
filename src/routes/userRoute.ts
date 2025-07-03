import { Router } from "express";
import UserController from "../controllers/implementation/UserController";
import { authenticateToken } from "../middleware/user/authMiddleware";
import CheckUserBlocked from "../middleware/user/CheckUserBlocked";
import AuthController from "../controllers/implementation/AuthController";
import ProfileController from "../controllers/implementation/ProfileController";
import EventController from "../controllers/implementation/EventController";
import WalletController from "../controllers/implementation/WalletController";
import PasswordController from "../controllers/implementation/PasswordController";
import EventProfileController from "../controllers/implementation/EventProfileController";
import { ChatController } from "../controllers/implementation/ChatController";
import cloudinary from '../config/cloudinary'; 
import multer from 'multer';
import { Readable } from 'stream';

import passport from 'passport'
import jwt from "jsonwebtoken";
import User from "../models/User";
import { RequestHandler } from "express";

const router = Router();
const authController = new AuthController();
const eventController = new EventController();
const profileController = new ProfileController();
const walletController = new WalletController()
const passwordController = new PasswordController();
const eventProfileController = new EventProfileController()
const chatController = new ChatController()

const storage = multer.memoryStorage();
const upload = multer({ storage });





router.get('/layout/:layoutId', UserController.getLayoutAndEvent);
router.post('/wallet-ticket-booking', walletController.bookTicketWithWalletController.bind(walletController));
router.get('/:userId/tickets', UserController.getUserTickets);
router.post("/:userId/tickets/:ticketId/cancel", UserController.cancelUserTicket);
router.put('/location',authenticateToken, eventController.updateLocation.bind(eventController));
router.get('/events-by-location',authenticateToken, eventController.getEventsNearUser.bind(eventController));
router.get("/chat/:roomId", chatController.getChatHistory.bind(chatController));
router.get("/chat/user/:userId", chatController.getChatsForUser.bind(chatController));
router.post('/events/book-ticket/:userId', eventController.bookEvent.bind(eventController));
router.get("/available-private-event-creators", eventProfileController.getAllPrivateCreatorsProfile.bind(eventProfileController))
router.get("/event-profile-info", eventProfileController.getProfileInfo.bind(eventProfileController));
router.get("/all-posts", eventProfileController.getAllPost.bind(eventProfileController));
router.get('/post-details-page/:id', eventProfileController.getPostDetails.bind(eventProfileController));
router.get("/profile-data", authenticateToken, CheckUserBlocked as RequestHandler, UserController.getUser as any);


//AuthController
router.post("/register", authController.signUp.bind(authController));
router.post("/verify-otp", authController.verifyOTP.bind(authController));
router.post("/resend-otp", authController.resendOTP.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.get("/logout", authController.logout.bind(authController));
router.post("/send-otp", authController.sendOtp.bind(authController));
router.post("/verify-otp-forgot-password", authController.verifyOtp.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));

//EventController
router.get('/public-events', eventController.getAllEvents.bind(eventController));
router.get('/event/:id', eventController.getEventById.bind(eventController));
router.get('/event-types', eventController.getEventType.bind(eventController));
router.get('/home-events', eventController.getHomeEvents.bind(eventController));

//ProfileController
router.put("/update-profile", authenticateToken, CheckUserBlocked as RequestHandler, profileController.updateProfile.bind(profileController) as RequestHandler)

//Wallet Controller
router.post('/wallet/add', walletController.addMoney.bind(walletController));
router.get('/wallet/:userId', walletController.getWallet.bind(walletController));
router.post('/wallet/checkout-session', walletController.createCheckoutSession.bind(walletController));
router.put('/change-password', authenticateToken, passwordController.changePassword)








router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", 
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login/failed" }),
  (req, res) => {
    const user: any = req.user;

    if (!user || !user._id) {
      return res.redirect(`${process.env.FRONTEND_URL}/login/failed`);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "15d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/user/oauth-success`);
  })

router.get("/oauth-user", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token found" });

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) return res.status(500).json({ message: "JWT refresh secret not configured" });

    const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ message: "JWT secret not configured" });

    const newAccessToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });

    res.json({ user, token: newAccessToken });
  } catch (error) {
    console.error("OAuth user fetch error:", error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});



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



export default router;
