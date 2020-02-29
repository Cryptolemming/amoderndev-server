const FavouritesService = {
  getFavouritePosts(knex, userId) {
    return knex
      .from('favorite_posts')
      .select('*')
      .where('user_id', userId)
  },
  addFavouritePost(knex, newFavourite) {
    return knex
      .into('favorite_posts')
      .insert(newFavourite)
      .returning('*')
      .then(([favouritePost]) => favouritePost)
  },
  deleteFavouritePost(knex, favouriteDelete) {
    return knex
      .raw(
        `DELETE
        FROM favorite_posts
        WHERE post_id = ${favouriteDelete.post_id}
        AND user_id = ${favouriteDelete.user_id}`
      )
  },
  getFavouriteComments(knex, userId) {
    return knex
      .from('favorite_comments')
      .select('*')
      .where('user_id', userId)
  },
  addFavouriteComment(knex, newFavourite) {
      return knex
      .into('favorite_comments')
      .insert(newFavourite)
      .returning('*')
      .then(([favouriteComment]) => favouriteComment)
  },
  deleteFavouriteComment(knex, favouriteDelete) {
    return knex
      .raw(
        `DELETE
        FROM favorite_comments
        WHERE comment_id = ${favouriteDelete.comment_id}
        AND user_id = ${favouriteDelete.user_id}`
      )
  },
}

module.exports = FavouritesService;
