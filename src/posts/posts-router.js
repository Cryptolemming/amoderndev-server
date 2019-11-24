const express = require('express')
const xss = require('xss')
const path = require('path')
const PostsService = require('./posts-service')

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
  .post()

postsRouter
  .route('/:post_id')
  .all()
  .get()
  .put()
  .delete()

module.exports = postsRouter;
