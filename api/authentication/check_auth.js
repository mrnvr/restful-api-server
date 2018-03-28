const jwt = require('jsonwebtoken')
// const cookiename = 'usercookie'

module.exports = (req, res, next) => {
  console.log(req.cookies)
  try {
    const token = req.cookies.usercookie
    req.userData = jwt.verify(token, process.env.TOKEN_KEY)
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed',
      error: error
    })
  }
}
