const CommentsService = {
  getAllComments(knex, postId) {
    return knex
      .select('*')
      .from('comments')
      .where('post_id', postId)
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
