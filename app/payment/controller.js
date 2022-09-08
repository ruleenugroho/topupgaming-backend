const Payment = require('./model');
const Bank = require('../bank/model');

module.exports = {
	index: async (req, res) => {
		try {
			const alertMessage = req.flash('alertMessage');
			const alertStatus = req.flash('alertStatus');

			const alert = { message: alertMessage, status: alertStatus };
			const payment = await Payment.find().populate('banks');
			res.render('admin/payment/view_payment', {
				payment,
				alert,
				name: req.session.user.name,
				title: 'Halaman Metode Pembayaran'
			})
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	},
	viewCreate: async (req, res) => {
		try {
			const banks = await Bank.find();
			res.render('admin/payment/create', {
				banks,
				name: req.session.user.name,
				title: 'Halaman tambah metode pembayaran'
			})
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	},
	actionCreate: async (req, res) => {
		try {
			const { type, banks } = req.body;

			let payment = await Payment({ type, banks });
			await payment.save();

			req.flash('alertMessage', 'Berhasil tambah payment');
			req.flash('alertStatus', 'success');

			res.redirect('/payment')
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	},
	viewEdit: async (req, res) => {
		try {
			const { id } = req.params;
			const payment = await Payment.findById(id).populate('banks');
			const banks = await Bank.find();
			res.render('admin/payment/edit', {
				payment,
				banks,
				name: req.session.user.name,
				title: 'Halaman ubah metode pembayaran'
			})
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	},
	actionEdit: async (req, res) => {
		try {
			const { id } = req.params;
			const { type, banks } = req.body;

			await Payment.findByIdAndUpdate(id, { type, banks });

			req.flash('alertMessage', 'Berhasil ubah payment');
			req.flash('alertStatus', 'success');

			res.redirect('/payment')
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	},
	actionDelete: async (req, res) => {
		try {
			await Payment.findByIdAndRemove(req.params.id);

			req.flash('alertMessage', 'Berhasil hapus payment');
			req.flash('alertStatus', 'success');

			res.redirect('/payment')
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	},
	actionStatus: async (req, res) => {
		try {
			const payment = await Payment.findOne({ _id: req.params.id });

			let status = payment.status === 'Y' ? 'N' : 'Y';

			await Payment.findOneAndUpdate({ _id: req.params.id }, {
				status
			})

			req.flash('alertMessage', 'Berhasil ubah status payment');
			req.flash('alertStatus', 'success');

			res.redirect('/payment')
		} catch (error) {
			req.flash('alertMessage', error.message);
			req.flash('alertStatus', 'danger');
			res.redirect('/payment');
		}
	}
}