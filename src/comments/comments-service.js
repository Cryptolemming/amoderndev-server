const CommentsService = {
  getAllComments(knex, postId) {
    return knex
      .raw(`
        SELECT *, u.username
        FROM comments c
        LEFT JOIN users u on c.user_id = u.id
        WHERE c.post_id = ${postId}
      `)
  },
  getCommentsByUser(knex, userId) {
    return knex
      .raw(`
        SELECT *, u.username
        FROM comments c
        LEFT JOIN users u on c.user_id = u.id
        WHERE c.user_id = ${userId}
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
