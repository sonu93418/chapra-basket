import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/profile', getProfile);
userRouter.patch('/profile', updateProfile);
