const User = require('../models/user')

const _ = require('lodash')
const fp = require('lodash/fp')

const vUserPassword = (data) => {
	return !_.isEmpty(data.username) && !_.isEmpty(data.password)
}

const processParams = fp.flow(
	fp.omitBy(fp.isEmpty),
	fp.mapValues(value => _.trim(value))
)

const redirectByType = (type) => {
	switch (type) {
		case 'admin': return '/admin'
		default: return '/user'
	}
}

const create = (req, res, next) => {
	const data = processParams(req.body)

	if (!data.password || !data.passwordConf || data.password !== data.passwordConf) {
		const error = new Error('Passwords do not match.')
		error.status = 400

		return next(error)
	}

	if (vUserPassword(data)) {
		let finalData = {
			username: data.username,
			password: data.password
		}

		if (!_.isEmpty(data.type)) finalData.type = data.type.toLowerCase()

		User.create(finalData, (err, user) => {
			if (err) return next(err)

			req.session.userId = user._id
			return res.redirect(redirectByType(user.type))
		})
	} else {
		const error = new Error('Invalid input data for User creation.')
		error.status = 400

		return next(error)
	}
}

const login = (req, res, next) => {
	const data = processParams(req.body)

	if (vUserPassword(data)) {
		User.authenticate(data.username, data.password, (err, user) => {
			if (err || !user) {
				const error = new Error('Wrong email or password.')
				error.status = 401

				return next(error)
			} else {
				req.session.userId = user._id
				return res.redirect(redirectByType(user.type))
			}
		})
	} else {
		const error = new Error('All fields required.')
		error.status = 400

		return next(error)
	}
}

const logout = (req, res, next) => {
	if (req.session) {
		req.session.destroy((err) => {
			if (err) {
				return next(err)
			} else {
				return res.redirect('/')
			}
		})
	}
}

const loadProfile = (userId, res, next, callback) => {
	User.findById(userId)
		.exec(function (err, user) {
			if (err) {
				return next(err);
			} else {
				callback(user)
			}
		});
}

const userProfile = (req, res, next) => {
	loadProfile(req.session.userId, res, next, (user) => {
		if (user === null) {
			var error = new Error('Not authorized! Go back!');
			error.status = 400;

			return next(error);
		} else {
			return res.render('user', { user: user })
		}
	})
}

const adminProfile = (req, res, next) => {
	loadProfile(req.session.userId, res, next, (user) => {
		if (user === null || user.type !== 'admin') {
			var error = new Error('Not authorized! Go back!');
			error.status = 400;

			return next(error);
		} else {
			return res.render('admin', { user: user })
		}
	})
}

module.exports = {
	adminProfile,
	create,
	login,
	logout,
	userProfile,
}
