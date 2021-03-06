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
 send user id matching the id int the cookie (if it exists)
 GET /api/users
 {
  _id: String
 }
 */
router.get('/', checkAuth, User.getUser)

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
router.post('/login', User.login)

/*
 update user data
 PATCH /api/users/update
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
router.delete('/', checkAuth, User.deleteUser)

router.post('/logout', checkAuth, User.logout)

module.exports = router
