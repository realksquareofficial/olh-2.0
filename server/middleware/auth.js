const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is invalid' });
  }
};

exports.isMaster = (req, res, next) => {
  if (req.user.role !== 'master') {
    return res.status(403).json({ msg: 'Access denied. Master only.' });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'master' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

exports.adminOnly = exports.isAdmin;