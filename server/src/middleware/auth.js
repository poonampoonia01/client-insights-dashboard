const jwt = require('jsonwebtoken');
const Advisor = require('../models/Advisor');
const asyncHandler = require('./asyncHandler');

/**
 * Verifies the Bearer token on the Authorization header, loads the
 * advisor it belongs to, and attaches it to req.advisor. Every client
 * route sits behind this so advisors only ever see their own clients.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }

  const advisor = await Advisor.findById(decoded.id);
  if (!advisor) {
    return res.status(401).json({ message: 'Advisor account no longer exists.' });
  }

  req.advisor = advisor;
  next();
});

module.exports = { protect };
