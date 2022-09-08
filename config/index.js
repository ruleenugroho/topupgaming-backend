const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

module.exports = {
	rootPath: path.resolve(__dirname, '..'),
	serviceName: process.env.SERVICE_NAME,
	urlDb: process.env.MONGO_URL,
	jwtKey: process.env.SECRET,
	bucketName: process.env.AWS_BUCKET_NAME,
	region: process.env.AWS_BUCKET_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRECT_KEY,
}