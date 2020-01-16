const FollowingService = {
  getAllFollowingById(knex, userId) {
    return knex
      .select('*')
      .from('following')
      .where('user_id', userId)
      .orWhere('follow', userId)
  },
  getFollowingById(knex, userId) {
    return knex
      .raw(`SELECT
        f.follow as following_id,
        u.username as following_username
        FROM
        following f
        JOIN
        users u
        ON
        f.follow = u.id
        WHERE
        f.user_id = ${userId};`
      )
  },
  insertFollowById(knex, newFollow) {
    return knex
      .insert(newFollow)
      .into('follows')
      .returning('*')
      .then(([follow]) => follow)
  },
  deleteFollowById(knex, followToDelete) {
    return knex
      .raw(
        `DELETE
        FROM follow
        WHERE user_id = ${followToDelete.user_id}
        AND follow = ${followToDelete.follow}`
      );
  }
}

module.exports = FollowingService;
