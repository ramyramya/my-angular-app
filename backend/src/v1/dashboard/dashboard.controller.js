/*const dashboardService = require('./dashboard.service');

const fs = require('fs');
const CryptoJS = require('crypto-js');

async function getUserInfo(req, res) {
  try {
    const userId = req.user.userId; // Extracted from the token via authMiddleware
    const userInfo = await dashboardService.fetchUserInfo(userId);

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, username: userInfo.username, thumbnail: userInfo.thumbnail });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}



module.exports = { getUserInfo};
*/


const AWS = require('aws-sdk');
const CryptoJS = require('crypto-js');
const dashboardService = require('./dashboard.service');
const knex = require('../../mysql/knex')

// Set up AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function getUserInfo(req, res) {
  try {
    const userId = req.user.userId; // Extracted from the token via authMiddleware
    const userInfo = await dashboardService.fetchUserInfo(userId);

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, username: userInfo.username, profile_pic: userInfo.profile_pic });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// Endpoint to get the presigned URL for uploading a profile photo
async function getPresignedUrl(req, res) {
  try {
    const { payload } = req.body;

    // Decrypt the incoming payload
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    const { fileName, fileType } = JSON.parse(decryptedData);

    // Ensure the required fields are present
    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing fileName or fileType' });
    }

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `profile-photos/${fileName}`,
      Expires: 60*50, // URL expiration time in seconds
      ContentType: fileType,
      //ACL: 'public-read' // Make the file publicly accessible
    };

    const presignedUrl = await s3.getSignedUrlPromise('putObject', s3Params);

    res.json({
      success: true,
      presignedUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-photos/${fileName}`
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ success: false, message: 'Error generating presigned URL' });
  }
}

async function updateProfilePic(req, res) {
  try {
    const userId = req.user.userId; // Extracted from token or session
    console.log("userId: ", userId);
    
    // Decrypt the incoming encrypted payload
    const secretKey = process.env.SECRET_KEY;  // Make sure your secret key is in .env
    const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);

    // Parse the decrypted data to get the file URL
    const { fileUrl } = JSON.parse(decryptedData);

    // Ensure the fileUrl is valid
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File URL is missing' });
    }

    // Update the user's profile picture URL in the database
    const updatedUser = await knex('users')  // Assuming your users table is named 'users'
      .where('id', userId)  // Assuming the user's ID is in the 'id' field
      .update({ profile_pic: fileUrl });

      console.log("updated user: ", updatedUser);

    if (updatedUser > 0) {
      return res.json({ success: true, message: 'Profile picture updated successfully', user: updatedUser[0] });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile pic:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { getUserInfo, getPresignedUrl, updateProfilePic };
