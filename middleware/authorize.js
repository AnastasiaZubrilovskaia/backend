const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    console.log('Authorization check:', {
      userRole: req.user?.role,
      requiredRoles: roles,
      path: req.path,
      method: req.method
    });

    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Доступ запрещен',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = authorize;