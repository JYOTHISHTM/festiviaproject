import express from 'express';
import { handleStripeWebhook } from '../controllers/implementation/WebhookController';
const router = express.Router();

router.post('/', handleStripeWebhook);

export default router;