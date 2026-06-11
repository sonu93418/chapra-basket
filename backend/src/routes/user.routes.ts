import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { optionalAuth } from '../middleware/auth.js';

export const userRouter = Router();

userRouter.use(optionalAuth);
userRouter.get('/profile', getProfile);
userRouter.patch('/profile', updateProfile);
