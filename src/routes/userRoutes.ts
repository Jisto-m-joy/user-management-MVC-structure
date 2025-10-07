import express from 'express';
import { getHome } from '../controllers/userController';

const router = express.Router();

router.get('/home', getHome);

export default router;