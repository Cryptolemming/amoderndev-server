const FollowingService = {
  getFollowingCountsById(knex, userId) {
    return knex
      .count('*', { as: 'following_count' })
      .from('following')
      .where('user_id', userId)
      .first()
  },
  getFollowerCountsById(knex, userId) {
    return knex
      .count('*', { as: 'follower_count' })
      .from('following')
      .where('follow', userId)
      .first()
  },
  getFollowingDataById(knex, userId) {
    return knex
      .raw(`
        SELECT
          f.follow as id,
          u.username as username
        FROM
          following f
        JOIN
          users u
        ON
          f.user_id = u.id
        WHERE
          f.user_id = ${userId}`
      )
  },
  getFollowerDataById(knex, userId) {
    return knex
      .raw(`
        SELECT
          f.user_id as id,
          u.username as username
        FROM
          following f
        JOIN
          users u
        ON
          f.follow = u.id
        WHERE
          f.follow = ${userId}`
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
