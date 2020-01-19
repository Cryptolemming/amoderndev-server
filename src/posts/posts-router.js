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
  user: post.username,
  title: xss(post.title),
  content: xss(post.content),
  comment_count: post.comment_count,
  date_created: post.date_created,
  topics: post.topics
})

postsRouter
  .route('/')
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')

    try {
      const posts = await PostsService.getAllPosts(knexInstance)
      res.json(posts.rows.map(post => serializePost(post)))
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
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId} = req.params;

    try {
      const post = await PostsService.getPostById(knexInstance, postId)
      if (!post) {
        return res.status(404).json({
          error: `Post does not exist`
        })
      }

      return res.status(201).json(serializePost(post))
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
    const knexInstance = req.app.get('db')
    const { id: userId } = req.user;
    const { post_id, topic_id } = req.params;
    // validate user owns post
    try {
      const post = await PostsService.getPostById(knexInstance, post_id)
      if (post.user_id !== userId) {
        return res.status(404).json({
          error: `User not owner of this post`
        })
      }
    } catch(err) {
      next(err)
    }

    req.postTopic = { post_id, topic_id };
    next()
  })
  .post(async (req, res, next) => {
    const knexInstance = req.app.get('db')

    try {
        const postTopic = await TopicsService.insertPostTopic(knexInstance, req.postTopic)
        return res.status(201).json(postTopic)
    } catch(err) {
      next(err)
    }

  })
  .delete(async (req, res, next) => {
    const knexInstance = req.app.get('db')

    try {
      TopicsService.deletePostTopic(knexInstance, req.postTopic)
      return res.status(204).end()
    } catch(err) {
      next(err)
    }

  })

module.exports = postsRouter;
