import { Request, Response } from 'express';
import User from '../models/User';

// Interface for user creation/update (for type safety)
interface CreateUserRequest extends Request {
  body: {
    username: string;
    email: string;
    password?: string; // Optional for updates
    role: 'user' | 'admin';
  };
}

// Interface for search query
interface SearchRequest extends Request {
  query: {
    search?: string;
  };
}

export const getDashboard = (req: Request, res: Response): void => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/admin/login');
  }
  res.render('admin/dashboard');
};

// GET /admin/users - List users with optional search
export const getUsers = async (req: SearchRequest, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    let query = {};
    const searchTerm = req.query.search;
    if (searchTerm) {
      query = { $or: [{ username: { $regex: searchTerm, $options: 'i' } }, { email: { $regex: searchTerm, $options: 'i' } }] };
    }
    const users = await User.find(query).select('-password'); // Exclude password for security
    res.render('admin/users', { users, searchTerm });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching users', error });
  }
};

// GET /admin/users/add - Show add user form
export const getAddUser = (req: Request, res: Response): void => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/admin/login');
  }
  res.render('admin/add-user', { error: null });
};

// POST /admin/users - Create new user
export const createUser = async (req: CreateUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('admin/add-user', { error: 'Email already in use' });
    }
    const newUser = new User({ username, email, password, role: role || 'user' });
    await newUser.save();
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', { message: 'Error creating user', error });
  }
};

// GET /admin/users/:id/edit - Show edit form
export const getEditUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }
    res.render('admin/edit-user', { user, error: null });
  } catch (error) {
    res.status(500).render('error', { message: 'Error fetching user for edit', error });
  }
};

// POST /admin/users/:id - Update user
export const updateUser = async (req: CreateUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    const { username, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }
    user.username = username;
    user.email = email;
    user.role = role;
    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', { message: 'Error updating user', error });
  }
};

// POST /admin/users/:id/delete - Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).redirect('/admin/users');
    }
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', { message: 'Error deleting user', error });
  }
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).redirect('/admin/users');
    }
    user.isBlocked = true;
    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', { message: 'Error blocking user', error });
  }
};

export const unblockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/admin/login');
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).redirect('/admin/users');
    }
    user.isBlocked = false;
    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', { message: 'Error unblocking user', error });
  }
};