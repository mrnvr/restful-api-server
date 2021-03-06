const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Tweet = require('./tweets')
const gravatar = require('gravatar')

const options = '_id username email avatar_url'
const cookieName = 'usercookie'

const userSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    avatar_url: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false
    }
  }
)

let User = module.exports = mongoose.model('User', userSchema)

// send id corresponding to the cookie
module.exports.getUser = (req, res) => {
  const userId = req.userData.userId
  if (userId) {
    res.status(200).send(userId)
  } else {
    res.status(404).json({
      message: 'No cookie'
    })
  }
}

// get user by id
module.exports.getUserById = (req, res) => {
  const userId = req.params.userId
  User.findOne({'_id': userId}).select(options).exec().then(user => {
    if (!user) {
      return res.status(404).json({
        message: 'No user matching the id'
      })
    } else {
      res.status(200).json(user)
    }
  }).catch(err => {
    res.status(404).json({
      message: 'Could not find user',
      error: err
    })
  })
}

// get user by name
module.exports.getUserByName = (req, res) => {
  const username = req.params.username
  User.find({'username': new RegExp(username)}).exec().then(docs => {
    if (docs.length > 0) res.status(200).json(docs)
    else {
      res.status(204).json({
        message: 'No data found'
      })
    }
  }).catch(err => {
    res.status(404).json({
      error: err
    })
  })
}

// add new user to the DB
module.exports.addUser = (req, res) => {
  User.findOne({email: req.body.email}).exec().then(user => {
    if (user) {
      res.status(409).json({
        message: 'Email already used. User creation aborted'
      })
    } else {
      if (req.body.password.length === 0) {
        return res.status(400).json({
          message: 'No password entered. User creation aborted'
        })
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            message: 'Error hashing password. User creation aborted',
            error: err
          })
        }
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          username: req.body.username,
          email: req.body.email,
          password: hash,
          avatar_url: gravatar.url(req.body.email, {s: '100', r: 'x', d: 'identicon'}, true)
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
}

// update infos
module.exports.updateInfos = (req, res) => {
  const id = req.userData.userId
  const operations = req.body
  const update = {}
  for (const op in operations) {
    if (op === '_id') {
      return res.status(403).json({
        message: 'User cannot update id. Update aborted'
      })
    }
    update[op] = operations[op]
  }
  User.update({_id: id}, {$set: update}).exec().then(result => {
    res.status(200).json(result)
  }).catch(err => {
    res.status(500).json({
      error: err
    })
  })
}

// delete user
module.exports.deleteUser = (req, res) => {
  const userId = req.userData.userId
  User.remove({_id: userId}).exec().then(result => {
    User.findOne({username: 'Deleted User'}).exec().then(doc => {
      const update = {user: {_id: doc._id}}
      Tweet.update({user: {_id: userId}}, {$set: update}, {multi: true}).exec().then(result => {}).catch(err => {
        res.status(500).json({
          error: err
        })
      })
    }).catch(err => {
      res.status(500).json({
        message: 'Could not link tweet',
        error: err
      })
    })
    res.clearCookie(cookieName, {
      path: '/',
      httpOnly: true,
      secure: true,
      domain: 'safe-journey-69409.herokuapp.com'
    })
    res.status(200).json({
      message: 'User deleted'
    })
  }).catch(err => {
    res.status(500).json({
      message: 'Could not delete user',
      error: err
    })
  })
}

// log in
module.exports.login = (req, res) => {
  User.findOne({email: req.body.email}).select('+password').exec().then(user => {
    if (!user) {
      return res.status(401).json({ // 204
        message: 'No user matching the email'
      })
    } else {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Authentication failed. Wrong password'
          })
        }
        if (result) {
          const token = jwt.sign({
            userId: user._id
          }, process.env.TOKEN_KEY)
          res.cookie(cookieName, token, {
            httpOnly: true,
            secure: true,
            domain: 'safe-journey-69409.herokuapp.com'
          })
          return res.status(200).send(user._id)
        }
        return res.status(401).json({
          message: 'Authentication failed'
        })
      })
    }
  }).catch(err => {
    res.status(401).json({
      message: 'Authentication failed',
      error: err
    })
  })
}

// log out -> clear session cookie
module.exports.logout = (req, res) => {
  res.clearCookie(cookieName, {
    path: '/',
    httpOnly: true,
    secure: true,
    domain: 'safe-journey-69409.herokuapp.com'
  }).send()
}
