const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()

const tweetRoutes = require('../api/routes/tweets')
const userRoutes = require('../api/routes/users')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') // give access to any client
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH')
    return res.status(200).json({})
  }
  next()
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log('Connected to port', port)
})

mongoose.connect('mongodb://admin:' + process.env.DB_PW + '@ds111279.mlab.com:11279/aws-twitter-project', (err) => {
  if (err) throw err
  console.log('connected')
})

// send request to one of these routes
app.use('/api/tweets', tweetRoutes)
app.use('/api/users', userRoutes)

app.all('/', (req, res) => {
  res.send('Hello World!')
})

// error if route is not found
app.use((req, res, next) => {
  const err = new Error('Not found')
  err.status = 404
  next(err)
})

// catch errors from everywhere
app.use((error, req, res) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})