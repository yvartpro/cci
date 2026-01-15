const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

exports.authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and attach the user info to req.user
    req.user = jwt.verify(token, JWT_SECRET);

    // Debugging: Log the decoded token
    console.log('Decoded JWT Token:', req.user);  // Check if the user ID is there

    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);  // Log for debugging
    return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
  }
};


exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - User not authenticated' })
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden - Insufficient role' })
  }

  next()
}
