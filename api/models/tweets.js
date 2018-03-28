const mongoose = require('mongoose')
const Schema = mongoose.Schema
const selectOptions = '_id content user date'
const limit = 3

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

// send tweets by "page"
module.exports.getTweets = (req, res) => {
  const tweetId = req.query.tweetId
  if (tweetId === undefined) {
    Tweet.find().select(selectOptions).populate('user').sort('-date').limit(limit).exec().then(docs => {
      res.status(200).json(docs)
    }).catch(err => {
      res.status(500).json({
        error: err
      })
    })
  } else {
    Tweet.findById(tweetId, 'date').then(doc => {
      const date = doc.date
      Tweet.find({date: {$lt: date}}).select(selectOptions).populate('user').sort('-date').limit(limit).exec().then(docs => {
        res.status(200).json(docs)
      }).catch(err => {
        res.status(500).json({
          error: err
        })
      })
    }).catch(err => {
      res.status(500).json({
        message: 'Not a valid id',
        error: err
      })
    })
  }
}

// send tweets by a given user
module.exports.getTweetsByUser = (req, res) => {
  const userId = req.params.userId
  const tweetId = req.query.tweetId
  if (tweetId === undefined) {
    Tweet.find({user: {'_id': userId}}).select(selectOptions).populate('user').sort('-date').limit(limit).exec().then(docs => {
      res.status(200).json(docs)
    }).catch(err => {
      res.status(500).json({
        message: 'No tweet found',
        error: err
      })
    })
  } else {
    Tweet.findById(tweetId, 'date').then(doc => {
      const date = doc.date
      Tweet.find({user: {'_id': userId}, date: {$lt: date}}).select(selectOptions).populate('user').sort('-date').limit(limit).exec().then(docs => {
        res.status(200).json(docs)
      }).catch(err => {
        res.status(204).json({
          message: 'Not tweet found',
          error: err
        })
      })
    }).catch(err => {
      res.status(500).json({
        message: 'Not a valid id',
        error: err
      })
    })
  }
}

// new tweet
module.exports.tweet = (req, res) => {
  const tweet = new Tweet({
    _id: new mongoose.Types.ObjectId(),
    content: req.body.content,
    user: req.userData.userId
  })
  tweet.save().then(result => {
    Tweet.populate(result, 'user')
    res.status(201).json({
      message: 'Tweet posted',
      newTweet: result
    })
  }).catch(err => {
    res.status(500).json({
      error: err
    })
  })
}

// delete tweet
module.exports.deleteTweet = (req, res) => {
  const tweetId = req.params.tweetId
  const userId = req.userData.userId
  Tweet.findOne({_id: tweetId, user: {_id: userId}}).exec().then(result => {
    if (!result) {
      res.status(204).json({
        message: 'No tweet found'
      })
    } else {
      Tweet.remove({_id: tweetId}).exec().then(result => {
        res.status(200).json({
          message: 'Tweet successfully deleted',
          moreInfo: result
        })
      }).catch(err => {
        res.status(500).json({
          message: 'Could not delete the tweet',
          error: err
        })
      })
    }
  })
}
