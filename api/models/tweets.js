const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tweetSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
)

const Tweet = module.exports = mongoose.model('Tweet', tweetSchema)

// send all tweets with an optional limit
module.exports.getTweets = (callback, limit) => {
  Tweet.find({}, callback).limit(limit)
}

// send tweets by a given user
module.exports.getTweetsByUser = (userId, callback) => {
  Tweet.find({user: {'_id': userId}}, callback)
}

// new tweet
module.exports.tweet = (tweet, callback) => {
  Tweet.save(tweet, callback)
}

// delete tweet
module.exports.deleteTweet = (tweetId, callback) => {
  Tweet.remove({_id: tweetId}, callback)
}
