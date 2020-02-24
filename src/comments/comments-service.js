const CommentsService = {
  getAllComments(knex) {
    return knex
      .raw(`
        SELECT c.id, c.user_id, u.username, c.content, c.post_id, c.date_created,
               array_agg(DISTINCT f.user_id) AS favourites_users
        FROM comments c
        LEFT JOIN users u on c.user_id = u.id
        LEFT JOIN favorite_comments f on f.comment_id = c.id
        GROUP BY c.id, u.username
      `)
  },
  getAllCommentsByPost(knex, postId) {
    return knex
      .raw(`
        SELECT c.id, c.user_id, u.username, c.content, c.post_id, c.date_created,
               array_agg(DISTINCT f.comment_id) AS favourites
        FROM comments c
        LEFT JOIN users u on c.user_id = u.id
        LEFT JOIN favorite_comments f on f.comment_id = c.id
        WHERE c.post_id = ${postId}
        GROUP BY c.id, u.username
      `)
  },
  getCommentsByUser(knex, userId) {
    return knex
      .raw(`
        SELECT c.id, c.user_id, u.username, c.content, c.post_id, c.date_created,
               array_agg(DISTINCT f.user_id) AS favourites_users
        FROM comments c
        LEFT JOIN users u on c.user_id = u.id
        LEFT JOIN favorite_comments f on f.comment_id = c.id
        WHERE c.user_id = ${userId}
        GROUP BY c.id, u.username
      `)
  },
  insertComment(knex, comment) {
    return knex
      .insert(comment)
      .into('comments')
      .returning('*')
      .then(([comment]) => comment)
  },
  deleteCommentById(knex, commentId, postId) {
    return knex
      .raw(
        `DELETE
        FROM comments
        WHERE id = ${commentId}
        AND post_id = ${postId}`
      )
  }
}

module.exports = CommentsService;
