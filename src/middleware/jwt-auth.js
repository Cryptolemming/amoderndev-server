const AuthService = require('../auth/auth-service')

const requireAuth = (req, res, next) => {
  const knex = req.app.get('db')

  const authToken = req.get('Authorization') || '';

  if (!authToken.toLowerCase().startsWith('bearer')) {
    return res.status(401).json({
      error: `You are not logged in`
    })
  }

  const bearerToken = authToken.slice(authToken.indexOf(' ') + 1)

  try {
    const payload = AuthService.verifyJWT(bearerToken)
    console.log(payload)
    AuthService.getUserByUserName(knex, payload.sub)
      .then(user => {
        console.log('user', user)
        if (!user) {
          res.status(401).json({
            error: `Unauthorized request`,
            reason: `User not found`
          })
        }
        console.log('here')
        req.user = user;
        next();
      })
      .catch(err => next(err))
  } catch(error) {
    return res.status(401).json({
      error: `Unauthorized request`,
      reason: error
    })
  }
}

module.exports = requireAuth;
