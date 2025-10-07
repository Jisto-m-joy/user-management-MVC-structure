import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export const getLogin = (req: Request, res: Response): void => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.render('auth/login', { error: null });
};

export const postLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
      if (user.isBlocked) {
        res.render('auth/login', { error: 'You are blocked from entering this site' });
        return;
      }
      req.session.user = { id: user._id.toString(), email: user.email, role: user.role };
      res.redirect('/user/home');
      return;
    }
    res.render('auth/login', { error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).render('error', { message: 'Login error', error });
  }
};

export const getAdminLogin = (req: Request, res: Response): void => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.render('admin/login', { error: null });
};

export const postAdminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    if (email !== process.env.ADMIN_EMAIL) {
      res.render('admin/login', { error: 'Invalid admin email' });
      return;
    }
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
    if (isMatch) {
      req.session.user = { email, role: 'admin' };
      res.redirect('/admin/dashboard');
      return;
    }
    res.render('admin/login', { error: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).render('error', { message: 'Admin login error', error });
  }
};

export const getSignup = (req: Request, res: Response): void => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.render('auth/signup', { error: null });
};

export const postSignup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.render('auth/signup', { error: 'Email already in use' });
      return;
    }
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    res.status(500).render('error', { message: 'Signup error', error });
  }
};

export const logout = (req: Request, res: Response): void => {
  const role = req.session.user?.role;
  req.session.destroy(() => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (role === 'admin') {
      res.redirect('/admin/login');
    } else {
      res.redirect('/login');
    }
  });
};