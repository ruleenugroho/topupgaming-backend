
const config = require('../../config')
const fs = require('fs')
const S3 = require("aws-sdk/clients/s3")

const s3 = new S3({
	region: config.region,
	accessKeyId: config.accessKeyId,
	secretAccessKey: config.secretAccessKey
})

module.exports = {
	uploadFile: (file) => {
		const fileStream = fs.createReadStream(file.path)

		const uploadParams = {
			Bucket: config.bucketName,
			Body: fileStream,
			Key: file.filename
		}

		return s3.upload(uploadParams).promise()
	},
	downloadFile: (fileKey) => {
		const downloadParams = {
			Key: fileKey,
			Bucket: config.bucketName
		}

		return s3.getObject(downloadParams).createReadStream()
	}
}