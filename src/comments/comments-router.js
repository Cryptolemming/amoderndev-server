const express = require('express')
const xss = require('xss')
const path = require('path')
const CommentsService = require('./comments-service')
const requireAuth = require('../middleware/jwt-auth')

const commentsRouter = express.Router()

const serializeComment = comment => ({
  id: comment.id,
  user: comment.user_id,
  post: comment.post_id,
  content: xss(comment.content),
  date_created: comment.date_created
})

commentsRouter
  .route('/:post_id')
  .all(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { post_id: postId } = req.params;

    try {
      const comment = await CommentsService.getCommentById(knexInstance, commentId);
      console.log(comment)
      if (comment) {
        req.comment = {...comment};
        next();
      }
      else {
        res.status(404).json({ error: `Comment not found`})
      }
    } catch(err) {
      next(err);
    }
  })
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const comment = req.comment;

    res.status(201).json(serializeComment(comment))
  })
  .put(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const commentToUpdate = req.comment;

    const { title, content } = req.body;
    const valuesToUpdate = { title, content }

    for (const [key, value] of Object.entries(valuesToUpdate)) {
      commentToUpdate[key] = value;
    }

    try {
      await CommentsService.updateComment(knexInstance, commentToUpdate);
      res.status(204).end()
    } catch(err) {
      next(err)
    }
  })
  .delete(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { comment_id: commentId } = req.params;
    console.log('comment id', commentId)
    try {
      await CommentsService.removeComment(knexInstance, commentId);
      res.status(204).end();
    } catch(err) {
      next(err)
    }
  })

module.exports = commentsRouter;
