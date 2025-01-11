const knex = require('../../mysql/knex');

async function fetchUserInfo(userId) {
  try {
    const user = await knex('users')
      .select('username', 'thumbnail')
      .where({ id: userId })
      .first();

    return user;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

module.exports = { fetchUserInfo };
