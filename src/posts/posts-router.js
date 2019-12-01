const express = require('express')
const xss = require('xss')
const path = require('path')
const PostsService = require('./posts-service')
const requireAuth = require('../middleware/jwt-auth')

const postsRouter = express.Router()

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
      res.status(200).json(posts.map(post => serializePost(post)))
    } catch(err) {
      next(err)
    }

  })
  .post(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    console.log(req.body)
    const { userId, title, content } = req.body;
    const newPost = { user_id: userId, title, content };

    for (const [key, value] of Object.entries(newPost)) {
      if (!newPost[key]) {
        res.status(400).json({ error: `Missing ${key}`});
      }
    }

    try {
      const post = await PostsService.insertPost(knexInstance, newPost)
      res.status(201).json(serializePost(post));
    } catch(err) {
      next(err);
    }
  })

postsRouter
  .route('/:post_id')
  .all(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId } = req.params;

    try {
      const post = await PostsService.getPostById(knexInstance, postId);
      console.log(post)
      if (post) {
        req.post = {...post};
        next();
      }
      else {
        res.status(404).json({ error: `Post not found`})
      }
    } catch(err) {
      next(err);
    }
  })
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const post = req.post;

    res.status(201).json(serializePost(post))
  })
  .put(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const postToUpdate = req.post;

    const { title, content } = req.body;
    const valuesToUpdate = { title, content }

    for (const [key, value] of Object.entries(valuesToUpdate)) {
      postToUpdate[key] = value;
    }

    try {
      await PostsService.updatePost(knexInstance, postToUpdate);
      res.status(204).end()
    } catch(err) {
      next(err)
    }
  })
  .delete(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId } = req.params;
    console.log('post id', postId)
    try {
      await PostsService.removePost(knexInstance, postId);
      res.status(204).end();
    } catch(err) {
      next(err)
    }
  })

module.exports = postsRouter;
