import express from 'express';
import { getAdminLogin, postAdminLogin } from '../controllers/authController';
import { 
  getDashboard, 
  getUsers, 
  getAddUser, 
  createUser, 
  getEditUser, 
  updateUser, 
  deleteUser, 
  blockUser, 
  unblockUser 
} from '../controllers/adminController';

const router = express.Router();

router.get('/login', getAdminLogin);
router.post('/login', postAdminLogin);
router.get('/dashboard', getDashboard);

// CRUD Routes for Users
router.get('/users', getUsers);
router.get('/users/add', getAddUser);
router.post('/users', createUser);
router.get('/users/:id/edit', getEditUser);
router.post('/users/:id', updateUser); // POST for update (simulate PATCH)
router.post('/users/:id/delete', deleteUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

export default router;