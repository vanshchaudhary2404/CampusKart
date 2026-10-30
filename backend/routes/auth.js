import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isAllowedCampusEmail, isValidEmail } from '../config/auth.js';

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'campus-bazaar-secret-key', {
    expiresIn: '7d',
  });

router.post('/register', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ message: 'Name must be between 2 and 80 characters' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Enter a valid email address' });
  }
  if (!isAllowedCampusEmail(email)) {
    return res.status(403).json({ message: 'Only authorized campus email domains can register' });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = createToken(user);

    res.status(201).json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        points: user.points ?? 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!isValidEmail(email) || !isAllowedCampusEmail(email)) {
    return res.status(403).json({ message: 'Use your authorized campus email address to log in' });
  }
  if (!password || password.length > 128) {
    return res.status(400).json({ message: 'Enter a valid password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        points: user.points ?? 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
