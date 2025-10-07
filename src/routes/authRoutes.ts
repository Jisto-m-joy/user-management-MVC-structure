import express from 'express';
import { getLogin, postLogin, getSignup, postSignup, logout, getAdminLogin, postAdminLogin } from '../controllers/authController';

const router = express.Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/signup', getSignup);
router.post('/signup', postSignup);
router.get('/logout', logout);
router.get('/', getLogin);

// Check session status for client-side
router.get('/check-session', (req: express.Request, res: express.Response) => {
  res.json({
    isAuthenticated: !!req.session.user,
    role: req.session.user?.role || null
  });
});

export default router;