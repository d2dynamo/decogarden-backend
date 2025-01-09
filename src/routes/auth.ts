import Router from 'express';

import passport from '../modules/passport';
import {
  verifyUserController,
  refreshTokensController,
  loginUserWithEmailController,
} from '../controllers/auth';

const router = Router();

router.post('/verify', verifyUserController);

router.get('/refreshTokens', refreshTokensController);

router.post(
  '/local',
  passport.authenticate('local'),
  loginUserWithEmailController
);

export default router;
