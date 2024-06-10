// Reused code from an earlier project

export const adminCheck = (req, res, next) => {
  if (req.session.user && req.session.user.roleId === 1) {
    next()
  } else {
    res.status(403).send({ data: 'Access denied' })
  }
}

export const checkAuth = (req, res, next) => {
  if (req.path === '/auth/login' || req.path === '/auth/reset-password') {
    return next()
  }

  if (req.session && req.session.user) {
    return next()
  }
  return res.status(401).send({ data: 'Unauthorised' })
}
