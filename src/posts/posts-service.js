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
  },
  getPostById(knex, postId) {
    return knex
      .from('posts')
      .select('*')
      .where('id', postId)
      .first()
  },
  updatePostById(knex, post) {
    return knex
      .from('posts')
      .where({id: post.id})
      .update(post)
      .returning('*')
      .then(([post]) => post)
  },
  deletePostById(knex, postId) {
    return knex
      .raw(
        `DELETE
        FROM posts
        WHERE id = ${postId}`
      );
  }
}

module.exports = PostsService;
