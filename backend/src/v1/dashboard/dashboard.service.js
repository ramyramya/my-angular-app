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


async function updateUserProfilePhoto(userId, photoUrl) {
    try {
      // Check if user exists by querying with userId
      const user = await knex('users').where('id', userId).first();
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Update the thumbnail field with the new photo URL
      await knex('users').where('id', userId).update({ thumbnail: photoUrl });
  
      // Return the updated user (or just return a success message)
      return { success: true, message: 'Profile photo updated successfully' };
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  }

module.exports = { fetchUserInfo, updateUserProfilePhoto };
