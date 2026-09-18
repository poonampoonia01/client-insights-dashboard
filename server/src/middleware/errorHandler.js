// Catches anything forwarded to next(err) — Mongoose validation errors,
// duplicate-key errors, and anything asyncHandler passes along — and
// turns it into a consistent JSON error shape.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  // Mongoose validation error (schema `required`, `min`, `enum`, etc.)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Mongoose bad ObjectId (e.g. a malformed :id in the URL)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Duplicate key (e.g. same client email twice for one advisor)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(', ') || 'field';
    return res.status(409).json({ message: `A record with that ${field} already exists.` });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(status).json({ message });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
