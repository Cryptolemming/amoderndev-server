const FollowingService = {
  getAllFollowing(knex, userId) {
    return knex
      .select('*')
      .from('following')
      .where('user_id', userId)
      .orWhere('follow', userId)
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
