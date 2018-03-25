const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))
const Tweet = require('../models/tweets')
const checkAuth = require('../authentication/check_auth')

/*
 send all tweets in the DB
 GET /api/tweets
 optional query string -> tweetId: send tweets with older date than this tweet
 {
   date: Date
   _id: String
   content: String
   author: {
      _id,
      username,
      email,
      avatar_url
   }
 }
 */
router.get('/', Tweet.getTweets)

/*
 send all tweets by an user
 GET /api/tweets/(userId)
 {
   _id: String,
   content: String,
   author: {
      _id,
      username,
      email,
      avatar_url
   }
 }
 */
router.get('/:userId', Tweet.getTweetsByUser)

/*
 create a new tweet
 POST /api/tweets
 HEADER Authorization-> token: String -> 'bearer tokenString'
 {
  content: String
 }
 */
router.post('/', checkAuth, Tweet.tweet)

/*
 delete an existing tweet
 POST /api/tweets
 HEADER Authorization-> token: String -> 'bearer tokenString'
 {
  tweetId: String
 }
 */
router.delete('/', checkAuth, Tweet.deleteTweet)

module.exports = router