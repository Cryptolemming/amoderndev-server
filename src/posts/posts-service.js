const PostsService = {
  getAllPosts(knex) {
    return knex
      .select('*')
      .from('posts')
  },
  insertPost(knex, post) {
    return knex
      .insert(post)
      .into('posts')
      .returning('*')
      .then(([post]) => post)
  }
}

module.exports = PostsService;
