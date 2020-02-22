const PostsService = {
  getAllPosts(knex) {
    return knex
      .raw(
        `SELECT distinct p.id, p.date_created, u.username, p.title, p.content,
                array_agg(DISTINCT c.id) AS comments, array_agg(DISTINCT t.title) AS topics,
                array_agg(DISTINCT fp.post_id) AS favourites,
                array_agg(DISTINCT fp.user_id) AS favourites_users,
                array_agg(DISTINCT c.user_id) AS comments_users
         FROM posts p
         LEFT JOIN users u on p.user_id = u.id
         LEFT JOIN post_topics pt on p.id = pt.post_id
         LEFT JOIN topics t on pt.topic_id = t.id
         LEFT JOIN comments c on c.post_id = p.id
         LEFT JOIN favorite_posts fp on fp.post_id = p.id
         GROUP BY p.id, u.username`
       )
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
