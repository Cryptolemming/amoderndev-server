const FavouritesService = {
  getFavouritePosts(knex, userId) {
    return knex
      .from('favorite_posts')
      .select('*')
  },
  getFavouriteComments(knex, userId) {
    return knex
      .from('favorite_comments')
      .select('*')
  }
}

module.exports = FavouritesService;
