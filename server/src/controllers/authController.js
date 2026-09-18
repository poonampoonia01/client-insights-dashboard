const jwt = require('jsonwebtoken');
const Advisor = require('../models/Advisor');
const asyncHandler = require('../middleware/asyncHandler');

function signToken(advisorId) {
  return jwt.sign({ id: advisorId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, firm } = req.body;

  const existing = await Advisor.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const advisor = await Advisor.create({ name, email, password, firm });
  const token = signToken(advisor._id);

  res.status(201).json({ token, advisor: advisor.toSafeObject() });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const advisor = await Advisor.findOne({ email }).select('+password');
  if (!advisor || !(await advisor.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(advisor._id);
  res.json({ token, advisor: advisor.toSafeObject() });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ advisor: req.advisor.toSafeObject() });
});

module.exports = { register, login, getMe };
