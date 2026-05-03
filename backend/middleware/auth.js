const jwt = require('jsonwebtoken');

// JWT认证中间件
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 角色验证中间件
exports.requireRole = (role) => {
  return (req, res, next) => {
    // 管理员可以访问所有权限
    if (req.user.role === 'admin') {
      return next();
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// 仅管理员权限中间件
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permissions required' });
  }
  next();
};
