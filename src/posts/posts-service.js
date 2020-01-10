const PostsService = {
  getAllPosts(knex) {
    return knex
      .select('*')
      .from('posts')
  },
  getPostById(knex, id) {
    return knex
      .select('*')
      .from('posts')
      .where('id', id)
      .first()
  },
  insertPost(knex, post) {
    return knex
      .insert(post)
      .into('posts')
      .returning('*')
      .then(([post]) => post)
  },
  updatePost(knex, post) {
    return knex('posts')
      .where({ id: post.id })
      .update({
        title: post.title,
        content: post.content
      })
  },
  removePost(knex, id) {
    return knex('posts')
      .where('id', id)
      .delete()
  }
}

module.exports = PostsService;
