import { Request, Response } from 'express';

export const getHome = (req: Request, res: Response): void => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.render('user/home', { user: req.session.user });
};