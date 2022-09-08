const mongoose = require('mongoose');
const bcryct = require('bcryptjs')

const HASH_ROUND = 10

let playersSchema = mongoose.Schema({
	email: {
		type: String,
		require: [true, 'Email harus diisi'],
	},
	name: {
		type: String,
		require: [true, 'nama harus diisi'],
		maxlength: [225, "panjang nama akun harus antara 3 - 225 karakter"],
		minlength: [3, "panjang nama akun harus antara 3 - 225 karakter"],
	},
	username: {
		type: String,
		require: [true, 'username harus diisi'],
		maxlength: [225, "panjang username akun harus antara 3 - 225 karakter"],
		minlength: [3, "panjang username akun harus antara 3 - 225 karakter"],
	},
	password: {
		type: String,
		require: [true, 'Password harus diisi'],
		maxlength: [225, "panjang password akun harus antara 8 - 225 karakter"],
		minlength: [8, "panjang password akun harus antara 8 - 225 karakter"],
	},
	role: {
		type: String,
		enum: ['admin', 'user'],
		default: 'user',
	},
	status: {
		type: String,
		enum: ['Y', 'N'],
		default: 'Y',
	},
	avatar: {
		type: String
	},
	fileName: {
		type: String
	},
	phoneNumber: {
		type: String,
		require: [true, 'Nomor telepon harus diisi'],
		maxlength: [13, "panjang nomor telepon akun harus antara 9 - 13 karakter"],
		minlength: [9, "panjang nomor telepon akun harus antara 9 - 13 karakter"],
	},
	favorite: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category'
	},
}, { timestamps: true });

playersSchema.path('email').validate(async function (value) {
	try {
		const count = await this.model('Player').countDocuments({ email: value })
		return !count;
	} catch (error) {
		throw error
	}
}, attr => `${attr.value} sudah terdaftar`)

playersSchema.pre('save', function (next) {
	this.password = bcryct.hashSync(this.password, HASH_ROUND)
	next()
})

module.exports = mongoose.model('Player', playersSchema);