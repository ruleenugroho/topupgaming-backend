const Voucher = require('../voucher/model')
const Category = require('../category/model')
const Bank = require('../bank/model')
const Payment = require('../payment/model')
const Nominal = require('../nominal/model')
const Transaction = require('../transaction/model')
const Player = require('../player/model')

module.exports = {
	landingPage: async (req, res) => {
		try {
			const voucher = await Voucher.find()
				.select('_id name status category thumbnail')
				.populate('category')

			res.status(200).json({ data: voucher })
		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},
	detailPage: async (req, res) => {
		try {
			const { id } = req.params
			const voucher = await Voucher.findOne({ _id: id })
				.populate('category')
				.populate('nominals')
				.populate('user', 'id name phoneNumber')

			const payment = await Payment.find().populate('banks');

			if (!voucher) {
				res.status(404).json({ message: 'voucher game tidak ditemukan.' })
			}

			res.status(200).json({
				data: {
					detail: voucher,
					payment
				}
			})

		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},
	category: async (req, res) => {
		try {
			const category = await Category.find()

			res.status(200).json({ data: category })
		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},
	checkout: async (req, res) => {
		try {
			const { accountUser, name, nominal, voucher, payment, bank } = req.body
			const res_voucher = await Voucher.findOne({ _id: voucher })
				.select('name category _id thumbnail user')
				.populate('category')
				.populate('user')

			if (!res_voucher) return res.status(404).json({ message: 'voucher game tidak ditemukan.' })

			const res_nominal = await Nominal.findOne({ _id: nominal })

			if (!res_nominal) return res.status(404).json({ message: 'nominal tidak ditemukan.' })

			const res_payment = await Payment.findOne({ _id: payment })

			if (!res_payment) return res.status(404).json({ message: 'metode pembayaran tidak ditemukan.' })

			const res_bank = await Bank.findOne({ _id: bank })

			if (!res_bank) return res.status(404).json({ message: 'bank tidak ditemukan.' })

			let tax = (10 / 100) * res_nominal._doc.price;
			let value = res_nominal._doc.price + tax;

			const payload = {
				historyVoucherTopup: {
					gameName: res_voucher._doc.name,
					category: res_voucher._doc.category ? res_voucher._doc.name : '',
					thumbnail: res_voucher._doc.thumbnail,
					coinName: res_nominal._doc.coinName,
					coinQuantity: res_nominal._doc.coinQuantity,
					price: res_nominal._doc.price,
				},
				historyPayment: {
					name: res_bank._doc.name,
					type: res_payment._doc.type,
					bankName: res_bank._doc.bankName,
					noRekening: res_bank._doc.noRekening,
				},
				name: name,
				accountUser: accountUser,
				tax: tax,
				value: value,
				player: req.player._id,
				historyUser: {
					name: res_voucher._doc.user?.name,
					phoneNumber: res_voucher._doc.user?.phoneNumber
				},
				category: res_voucher._doc.category?._id,
				user: res_voucher._doc.user?._id,
			}

			const transaction = new Transaction(payload)
			await transaction.save()

			res.status(201).json({
				data: transaction
			})

		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},

	history: async (req, res) => {
		try {
			const { status = '' } = req.query

			let criteria = {}

			if (status.length) {
				criteria = {
					...criteria,
					status: { $regex: `${status}`, $options: 'i' }
				}
			}

			if (req.player._id) {
				criteria = {
					...criteria,
					player: req.player._id
				}
			}

			const history = await Transaction.find(criteria)

			let total = await Transaction.aggregate([
				{ $match: criteria },
				{
					$group: {
						_id: null,
						value: { $sum: "$value" }
					}
				}
			])

			res.status(200).json({
				data: history,
				total: total.length ? total[0].value : 0
			})

		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},

	historyDetail: async (req, res) => {
		try {
			const { id } = req.params

			const history = await Transaction.findOne({ _id: id })

			if (!history) return res.status(404).json({ message: "history tidak ditemukan." })

			res.status(200).json({ data: history })

		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},

	dashboard: async (req, res) => {
		try {
			const count = await Transaction.aggregate([
				{
					$match: { player: req.player._id }
				},
				{
					$group: {
						_id: '$category',
						value: { $sum: '$value' }
					}
				}
			])

			const category = await Category.find({})

			category.forEach(element => {
				count.forEach(data => {
					if (data._id.toString() === element._id.toString()) {
						data.name = element.name
					}
				})
			})

			const history = await Transaction.find({ player: req.player._id })
				.populate('category')
				.sort({ 'updatedAt': -1 })

			res.status(200).json({
				data: history,
				count: count
			})

		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},

	profile: async (req, res) => {
		try {

			const player = {
				id: req.player._id,
				username: req.player.username,
				email: req.player.email,
				name: req.player.name,
				avatar: req.player.avatar,
				phone_number: req.player.phoneNumber,
			}
			res.status(200).json({ data: player })
		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},

	editProfile: async (req, res) => {
		try {
			const { name = "", phoneNumber = "" } = req.body

			const payload = {}

			if (name.length) payload.name = name
			if (phoneNumber.length) payload.phoneNumber = phoneNumber

			if (req.file) {
				const { uploadFile } = require('../middleware/s3')
				const result = await uploadFile(req.file)
				console.log(result)
				const fs = require('fs')
				if (fs.existsSync(req.file.path)) {
					fs.unlinkSync(req.file.path);
				}

				player = await Player.findOneAndUpdate({ _id: req.player.id }, {
					...payload,
					avatar: result.Key
				}, { new: true, runValidators: true })

				res.status(201).json({
					data: {
						id: player.id,
						name: player.name,
						phoneNumber: player.phoneNumber,
						avatar: player.avatar
					}
				})
			} else {
				const player = await Player.findOneAndUpdate({
					_id: req.player._id,
				}, payload, { new: true, runValidators: true })

				res.status(201).json({
					data: {
						id: player.id,
						name: player.name,
						phoneNumber: player.phoneNumber,
						avatar: player.avatar
					}
				})
			}
		} catch (error) {
			res.status(500).json({ message: error.message || 'Internal server error' })
		}
	},

	getImage: (req, res) => {
		const { downloadFile } = require('../middleware/s3')
		const key = req.params.key
		const readStream = downloadFile(key)

		readStream.pipe(res)
	}
}