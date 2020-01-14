require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const postsRouter = require('./posts/posts-router')
const commentsRouter = require('./comments/comments-router')
const followingRouter = require('./following/following-router')

const app = express()
const bodyParser = express.json()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())
app.use(bodyParser)

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/following', followingRouter)

app.get("/", (req, res) => {
  res.send("A Modern Dev API");
})

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app;
