const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const checkAuth = require('../authentication/check_auth')

const options = '_id username email avatar_url'

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
router.get('/', (req, res) => {
  User.find().select(options).exec().then(docs => {
    res.status(200).json(docs)
  }).catch(err => {
    res.status(500).json({
      message: 'Could not load users',
      error: err
    })
  })
})

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
router.get('/:userId', (req, res) => {
  const userId = req.params.userId
  User.find({'_id': userId}).exec().then(docs => {
    res.status(200).json(docs)
  }).catch(err => {
    res.status(500).json({
      message: 'Could not find user',
      error: err
    })
  })
})

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
router.get('/find/:username', (req, res) => {
  const username = req.params.username
  User.find({'username': new RegExp(username)}).exec().then(docs => {
    if (docs) res.status(200).json(docs)
    else {
      res.status(204).json({
        message: 'No data found'
      })
    }
  }).catch(err => {
    res.status(500).json({
      message: 'Could not find user',
      error: err
    })
  })
})

/*
 create new user
 POST /api/users/signup
 {
  username: String
  email: String
  password: String
 }
 */
router.post('/signup', (req, res) => {
  User.find({email: req.body.email}).exec().then(user => {
    if (user) {
      return res.status(409).json({
        message: 'Email already used'
      })
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            message: 'No password entered',
            error: err
          })
        }
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          username: req.body.username,
          email: req.body.email,
          password: hash
        })
        newUser.save().then(result => {
          res.status(201).json({
            message: 'User created',
            createdUser: result
          })
        }).catch(err => {
          res.status(500).json({
            message: 'Signup failed',
            error: err
          })
        })
      })
    }
  })
})

/*
 create new user
 POST /api/users/login
 {
  email: String
  password: String
 }
 */
router.post('/login', (req, res) => {
  User.findOne({email: req.body.email}).select('+password').exec().then(user => {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: 'Authentication failed'
        })
      }
      if (result) {
        const token = jwt.sign({
          userId: user._id,
          email: user.email
        }, process.env.TOKEN_KEY,
        {
          expiresIn: '1h'
        })
        return res.status(200).json({
          message: 'Authentication succeeded',
          token: token
        })
      }
      return res.status(401).json({
        message: 'Authentication failed'
      })
    })
  }).catch(err => {
    res.status(500).json({
      message: 'Authentication failed',
      error: err
    })
  })
})

/*
 update user data
 PATCH /api/users/update/username
 HEADER Authorization-> token: String
  {
    fieldName: new value,
    ...
  }
 you can update as many fields as you want (1 to number of field)
 */
router.patch('/update/:userId', checkAuth, (req, res) => {
  const id = req.params.userId
  const operations = req.body
  const update = {}
  for (const op in operations) {
    update[op] = operations[op]
  }
  User.update({_id: id}, {$set: update}).exec().then(result => {
    res.status(200).json(result)
  }).catch(err => {
    res.status(500).json({
      error: err
    })
  })
})

/*
 delete user
 DELETE /api/users/delete
 HEADER Authorization-> token: String
 {
  userId: String
 }
 */
router.delete('/delete/', checkAuth, (req, res) => {
  const userId = req.body.userId
  User.remove({_id: userId}).exec().then(result => {
    res.status(200).json({
      message: 'User deleted'
    })
  }).catch(err => {
    res.status(500).json({
      message: 'Could not delete user',
      error: err
    })
  })
})

module.exports = router
