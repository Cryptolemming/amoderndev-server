const express = require('express')
const xss = require('xss')
const path = require('path')
const PostsService = require('./posts-service')
const requireAuth = require('../middleware/jwt-auth')
const postsRouter = express.Router()
const bodyParser = express.json()

const serializePost = post => ({
  id: post.id,
  user: post.user_id,
  title: xss(post.title),
  content: xss(post.content),
  comment_count: post.comment_count,
  date_created: post.date_created
})

postsRouter
  .route('/')
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')

    try {
      const posts = await PostsService.getAllPosts(knexInstance)
      res.json(posts.map(post => serializePost(post)))
    } catch(err) {
      next(err)
    }

  })
  .post([bodyParser, requireAuth], async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { title, content } = req.body;

    try {
      for (const key of ['title', 'content']) {
        if (!req.body[key]) {
          throw `Missing ${key} in request body`
        }
      }
    } catch(err) {
      return res.status(400).json({
        error: err
      })
    }

    const post = { user_id: parseInt(req.user.id), title, content, }

    try {
      const newPost = await PostsService.insertPost(knexInstance, post)
      console.log('post', newPost)
      return res.json(serializePost(newPost))
    } catch(err) {
      next(err)
    }

  })

postsRouter
  .route('/:post_id')
  .all()
  .get()
  .put()
  .delete()

module.exports = postsRouter;
