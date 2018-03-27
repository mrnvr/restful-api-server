const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const router = express.Router()
const checkAuth = require('../authentication/check_auth')

router.use(cookieParser())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))
const User = require('../models/users')

/*
 send all users
 GET /api/users
 {
  _id: String
  username: String
  email: String
  avatar_url: String
 }
 */
router.get('/', User.getUsers)

/*
 send user matching the id
 GET /api/users/(userId)
 {
  _id: String
  username: String
  email: String
  avatar_url: String
 }
 */
router.get('/:userId', User.getUserById)

/*
 send user(s) data for the name in the url
 GET /api/users/find/(username)
 {
  _id: String
  username: String
  email: String
  avatar_url: String
 }
 */
router.get('/find/:username', User.getUserByName)

/*
 create new user
 POST /api/users/signup
  {
    username: String
    email: String
    password: String
  }
*/
router.post('/signup', User.addUser)

/*
 connect user
 POST /api/users/login
 {
  email: String
  password: String
 }
 send back a cookie to identify the user
 */
router.post('/login', (req, res) => {
  // res.cookie(cookieName, {token: token}, { maxAge: 300000, httpOnly: true, secure: true }).send()  /* 5min */
  res.cookie('cookieName', {success: true, message: 'cookieValue'}, {maxAge: 300000, domain: 'https://safe-journey-69409.herokuapp.com', secure: true})
})

/*
 update user data
 PATCH /api/users/update/username
  {
    fieldName: new value,
    ...
  }
 you can update as many fields as you want (1 to number of field)
 */
router.patch('/update', checkAuth, User.updateInfos)

/*
 delete user
 DELETE /api/users/delete
 {
  userId: String
 }
 */
router.delete('/delete', checkAuth, User.deleteUser)

module.exports = router
