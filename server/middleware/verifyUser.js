const jwt = require('jsonwebtoken');

// Dummy verify middleware which checks for a token cookie and validates it.
// Allows only users with email 'admin' (as per dummy login flow) to perform protected actions.
function verifyUser(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, process.env.JWTSECRET);
    // simple admin check
    if (!payload || payload.email !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    // attach user info to request if needed
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyUser;