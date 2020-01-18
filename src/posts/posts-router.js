const express = require('express')
const xss = require('xss')
const path = require('path')
const PostsService = require('./posts-service')
const TopicsService = require('../topics/topics-service')
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
  .post(requireAuth, async (req, res, next) => {
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
      return res.status(201).json(serializePost(newPost))
    } catch(err) {
      next(err)
    }
  })

postsRouter
  .route('/:post_id')
  .all(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId} = req.params;

    try {
      const post = await PostsService.getPostById(knexInstance, postId)
      if (!post) {
        return res.status(404).json({
          error: `Post does not exist`
        })
      }

      if (req.user.id !== post.user_id) {
        return res.status(404).json({
          error: `User not the owner of this post`
        })
      }

      req.post = post;
    } catch(err) {
      next(err)
    }

    next()
  })
  .get(async (req, res, next) => {
    try {
      res.status(201).json(serializePost(req.post))
    } catch(err) {
      next(err)
    }
  })
  .put(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { title, content } = req.body;
    const post = req.post;

    if (title) { post.title = title; }
    if (content) { post.content = content; }

    try {
      const updatedPost = await PostsService.updatePostById(knexInstance, post)
      return res.status(201).json(serializePost(updatedPost))
    } catch(err) {
      next(err)
    }

  })
  .delete(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const post = req.post;

    try {
      await PostsService.deletePostById(knexInstance, post.id)
      res.status(204).end()
    } catch(err) {
      next(err)
    }
  })

postsRouter
  // add and remove topics from a post
  .route('/:post_id/topics/:topic_id')
  .all(requireAuth, async (req, res, next) => {

  })
  .post(async (req, res, next) => {

  })
  .delete()

module.exports = postsRouter;
