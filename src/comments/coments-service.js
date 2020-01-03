const CommentsService = {
  getAllComments(knex) {
    return knex
      .select('*')
      .from('comments')
  },
  getCommentById(knex, id) {
    return knex
      .select('*')
      .from('comments')
      .where('id', id)
      .first()
  },
  insertComment(knex, comment) {
    return knex
      .insert(comment)
      .into('comments')
      .returning('*')
      .then(([comment]) => comment)
  },
  updateComment(knex, comment) {
    return knex('comments')
      .where({ id: comment.id })
      .update({
        title: comment.title,
        content: comment.content
      })
  },
  removeComment(knex, id) {
    return knex('comments')
      .where('id', id)
      .delete()
  }
}

module.exports = CommentsService;
