const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const uploadFile = async (file) => {
  const fileExtension = file.originalname.split('.').pop();
  const s3Key = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      s3Key: s3Key,
      location: result.Location
    };
  } catch (error) {
    throw new Error(`Error uploading file to S3: ${error.message}`);
  }
};

const deleteFile = async (s3Key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error(`Error deleting file from S3: ${error.message}`);
  }
};

const getFile = async (s3Key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
  };

  try {
    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    throw new Error(`Error getting file from S3: ${error.message}`);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFile
}; 