const express = require('express')
const path = require('path')
const FollowingService = require('./following-service')
const UsersService = require('../users/users-service')
const requireAuth = require('../middleware/jwt-auth')
const followingRouter = express.Router()
const bodyParser = express.json()

followingRouter
  // following counts are public
  .route('/:user_name')
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const userName = req.params.user_name;

    try {
      const user = await UsersService.getUserByUsername(knexInstance, userName)
      req.user = user
    } catch(err) {
      next(err)
    }

    try {
      const user = req.user;
      const { following_count } = await FollowingService.getFollowingCountsById(knexInstance, user.id)
      const { follower_count } = await FollowingService.getFollowerCountsById(knexInstance, user.id)
      return res.status(201).json({
        following_count,
        follower_count
      })
    } catch(err) {
      next(err)
    }
  })

followingRouter
  // authorization for detailed following info of logged in user
  .route('/')
  .get(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const userId = req.user.id;

    try {
      const result = await FollowingService.getFollowingById(knexInstance, userId)
      return res.status(201).json({fields: result.fields, rows: result.rows})
    } catch(err) {
      next(err)
    }
  })

followingRouter
  .route('/')
  .all(requireAuth, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const userId = req.user.id;
    const { follow } = req.body;

    try {
      if (!follow) {
        throw `Missing user_id to follow`
      }

      const followedUser = await UsersService.getUserById(knexInstance, follow)
    } catch(err) {
      return res.status(400).json({
        error: err
      })
    }

    next()
  })
  .post(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const userId = req.user.id;
    const { follow } = req.body;
    const newFollow = { user_id: userId, follow }

    try {
      const successfulFollow = await FollowingService.insertFollowById(knexInstance, newFollow)
      res.status(201).json(successfulFollow)
    } catch(err) {
      next(err)
    }
  })
  .delete(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const userId = req.user.id;
    const { follow } = req.body;
    const followToDelete = { user_id: userId, follow }

    try {
      await FollowingService.deleteFollowById(knexInstance, followToDelete)
      return res.status(204).end()
    } catch(err) {
      next(err)
    }
  })

module.exports = followingRouter;
