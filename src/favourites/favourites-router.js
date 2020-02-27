const express = require('express')
const requireAuth = require('../middleware/jwt-auth')
const FavouritesService = require('./favourites-service')

const favouritesRouter = express.Router()

const serializeFavouritePost = (({post_id}) => post_id)

const serializeFavouriteComment = (({comment_id}) => comment_id)

favouritesRouter
  .route('/')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { user } = req;

    try {
      const favouritePosts = await FavouritesService.getFavouritePosts(knexInstance, user.id)
      const favouriteComments = await FavouritesService.getFavouriteComments(knexInstance, user.id)
      if (!favouritePosts && !favoriteComments) {
        return res.status(404).json({
          error: `No favourites for that user`
        })
      }
      const favouritesByUser = {
        posts: favouritePosts ? favouritePosts.map(post => serializeFavouritePost(post)) : [],
        comments: favouriteComments ? favouriteComments.map(comment => serializeFavouriteComment(comment)) : []
      }
      res.status(201).json(favouritesByUser)
    } catch(err) {
      next(err)
    }
  })

favouritesRouter
  .route('/post')
  .all(requireAuth)
  .post(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { user } = req;
    const { post_id } = req.body;

    const newFavourite = { user_id: user.id, post_id }

    try {
      const favouritePost = await FavouritesService.addFavouritePost(knexInstance, newFavourite)
      if (!newFavourite) {
        return res.status(404).json({
          error: `Favourite not added`
        })
      }
      res.status(201).json(favouritePost)
    } catch(err) {
      next(err)
    }
  })
  .delete(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { user } = req;
    const { post_id } = req.body;

    const favouriteDelete = { user_id: user.id, post_id }

    try {
      const deletedFavourite = await FavouritesService.deleteFavouritePost(knexInstance, favouriteDelete)
      if (!deletedFavourite) {
        return res.status(404).json({
          error: `Favourite not deleted`
        })
      }
      return res.status(204).end()
    } catch(err) {
      next(err)
    }
  })

favouritesRouter
  .route('/comment')
  .all(requireAuth)
  .post(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { user } = req;
    const { comment_id } = req.body;

    const newFavourite = { user_id: user.id, comment_id }

    try {
      const favouriteComment = await FavouritesService.addFavouriteComment(knexInstance, newFavourite)
      if (!newFavourite) {
        return res.status(404).json({
          error: `Favourite not added`
        })
      }
      res.status(201).json(favouriteComment)
    } catch(err) {
      next(err)
    }
  })
  .delete(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { user } = req;
    const { comment_id } = req.body;

    const favouriteDelete = { user_id: user.id, comment_id }

    try {
      const deletedFavourite = await FavouritesService.deleteFavouriteComment(knexInstance, favouriteDelete)
      if (!deletedFavourite) {
        return res.status(404).json({
          error: `Favourite not deleted`
        })
      }
      res.status(204).end()
    } catch(err) {
      next(err)
    }
  })

module.exports = favouritesRouter;
