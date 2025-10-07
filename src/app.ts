import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/userManagement' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Global cache-control headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Authentication Middleware: Redirect logged-in users/admins
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    if (req.path.startsWith('/admin/login') && req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    if (req.path.startsWith('/login') && req.session.user.role === 'user') {
      return res.redirect('/user/home');
    }
  }
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).render('error', { message: 'Page not found' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});