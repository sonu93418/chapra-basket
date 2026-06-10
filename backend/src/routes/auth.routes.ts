import { Router } from 'express';
import {
  logoutController,
  refreshController,
  sendOtpController,
  sendOtpSchema,
  verifyOtpController,
  verifyOtpSchema,
} from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';

export const authRouter = Router();

authRouter.post('/send-otp', validateBody(sendOtpSchema), sendOtpController);
authRouter.post('/verify-otp', validateBody(verifyOtpSchema), verifyOtpController);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', logoutController);
