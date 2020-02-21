const express = require('express')
const requireAuth = require('../middleware/jwt-auth')
const FavouritesService = require('./favourites-service')

const favouritesRouter = express.Router()

const serializeFavouritePost = ({post_id}) => ({
  id: post_id
})

const serializeFavouriteComment = ({comment_id}) => ({
  id: comment_id
})

favouritesRouter
  .route('/')
  .get(requireAuth, async (req, res, next) => {
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

module.exports = favouritesRouter;
