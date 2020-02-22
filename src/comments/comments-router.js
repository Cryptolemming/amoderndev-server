const express = require('express')
const xss = require('xss')
const path = require('path')
const CommentsService = require('./comments-service')
const PostsService = require('../posts/posts-service')
const requireAuth = require('../middleware/jwt-auth')

const commentsRouter = express.Router()

const serializeComment = comment => ({
  id: comment.id,
  user: comment.user_id,
  username: comment.username,
  post: comment.post_id,
  content: xss(comment.content),
  favourites: comment.favourites,
  date_created: comment.date_created
})

commentsRouter
  .route('/')
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')

    try {
      const comments = await CommentsService.getAllComments(knexInstance)
      if (!comments) {
        return res.status(404).json({
          error: `Comments not found for thi suser`
        })
      }
      res.status(201).json(comments.rows.map(comment => serializeComment(comment)))
    } catch(err) {
      next(err)
    }
  })

commentsRouter
  .route('/user')
  .get(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { user } = req;

    try {
      const comments = await CommentsService.getCommentsByUser(knexInstance, user.id);
      if (!comments) {
        return res.status(404).json({
          error: `Comments not found for this user`
        })
      }
      res.status(201).json(comments.rows.map(comment => serializeComment(comment)))
    } catch(err) {
      next(err)
    }
  })

commentsRouter
  .route('/:post_id')
  .all(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId } = req.params;

    try {
      const post = await PostsService.getPostById(knexInstance, postId);
      if (!post) {
        return res.status(404).json({
          error: `Post does not exist`
        })
      }
      next()
    } catch(err) {
      next(err)
    }
  })
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId } = req.params;

    try {
      const comments = await CommentsService.getAllCommentsByPost(knexInstance, postId);
      res.status(201).json(comments.rows.map(comment => serializeComment(comment)))
    } catch(err) {
      next(err);
    }
  })
  .post(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { content } = req.body;
    const { post_id } = req.params;
    const { id: user_id } = req.user;

    const newComment = { user_id, post_id, content }

    try {
      const comment = await CommentsService.insertComment(knexInstance, newComment)
      res.status(201).json(serializeComment(comment))
    } catch(err) {
      next(err)
    }
  })
  .delete(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { comment_id: commentId } = req.body;
    const { post_id: postId } = req.params;

    try {
      await CommentsService.deleteCommentById(knexInstance, commentId, postId);
      res.status(204).end();
    } catch(err) {
      next(err)
    }
  })


module.exports = commentsRouter;
