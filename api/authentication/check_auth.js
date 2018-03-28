const jwt = require('jsonwebtoken')
const cookieName = 'usercookie'

module.exports = (req, res, next) => {
  console.log(req)
  try {
    const token = req.cookies[cookieName]
    req.userData = jwt.verify(token, process.env.TOKEN_KEY)
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed',
      error: error
    })
  }
}
