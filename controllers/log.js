const mongoose = require('mongoose')
const Log = require('../models/log')
const User = require('../models/user')

const create = (req, res, next) => {
	const data = req.body

	if (!data.details) {
		const error = new Error('Must provide details and an optional user ID to create a Log')
		error.status = 400

		return next(error)
	} else if (data.user) {
		User.findOne({ _id: data.user }, (err, user) => {
			if (err) return next(err)

			if (user === null) {
				const error = new Error('There is no User with the provided ID')
				error.status = 400

				return next(error)
			} else {
				data.user = user._id

				Log.create(data, (err, log) => {
					if (err) return next(err)
					return res.status(200).send(log)
				})
			}
		})
	} else {
		Log.create(data, (err, log) => {
			if (err) return next(err)
			return res.status(200).send(log)
		})
	}
}

const saveLog = (details, user, callback) => {
	if (details) {
		let data = { details }
		if (user) data.user = user

		Log.create(data, callback)
	}
}

const delt = (req, res, next) => {
	const { id } = req.body

	if (!id) {
		const error = new Error('Must provide an ID to delete a Log')
		error.status = 400

		return next(error)
	} else {
		Log.findByIdAndRemove(id, (err, log) => {
			if (err) return next(err)

			if (log === null) {
				const error = new Error('There is no Log with the provided ID')
				error.status = 400

				return next(error)
			} else {
				return res.status(200).send(log)
			}
		})
	}
}

const get = (req, res, next) => {
	Log.find()
		.populate('user', '_id username')
		.exec((err, logs) => {
			if (err) return next(err)

			if (logs === null) {
				const error = new Error('There are no Logs registered')
				error.status = 400

				return next(error)
			} else {
				return res.status(200).send(logs)
			}
		})
}

module.exports = {
	create,
	delt,
	get,
	saveLog
}
