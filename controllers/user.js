const User = require('../models/user')

const log = require('./log')

const vPassword = (password, confirmation) => {
	return password && confirmation && password === confirmation
}

const vUserPassword = (data) => {
	return data.username && data.password
}

const redirectByType = (type) => {
	switch (type) {
		case 'admin': return '/admin'
		default: return '/user'
	}
}

const create = (req, res, next) => {
	const data = req.body

	if (!vPassword(data.password, data.passwordConf)) {
		const error = new Error('Passwords do not match')
		error.status = 400

		log.saveLog(`Tried to create a new User but got error: ${error.message || ''}`)

		return next(error)
	}

	if (vUserPassword(data)) {
		let finalData = {
			username: data.username,
			password: data.password
		}

		if (data.type) finalData.type = data.type

		User.create(finalData, (err, user) => {
			if (err) {
				log.saveLog(`Tried to create a new User but got error: ${err.message || ''}`)
				return next(err)
			}

			log.saveLog(`A new User with username ${user.username || ''} and ID ${user._id || ''} was created`)

			req.session.userId = user._id
			return res.redirect(redirectByType(user.type))
		})
	} else {
		const error = new Error('Invalid Username or Password to create a User')
		error.status = 400

		log.saveLog(`Tried to create a new User but got error: ${error.message || ''}`)

		return next(error)
	}
}

const delt = (req, res, next) => {
	const { username, id } = req.body

	if (!username && !id) {
		const error = new Error('Must provide either a Username or the User ID to delete a User')
		error.status = 400

		log.saveLog(`Tried to delete a User but got error: ${error.message || ''}`)

		return next(error)
	} else if (username) {
		User.findOneAndRemove({ username }, (err, user) => {
			if (err) {
				log.saveLog(`Tried to delete a User but got error: ${err.message || ''}`)
				return next(err)
			}

			return res.status(200).send(user)
		})
	} else if (id) {
		User.findByIdAndRemove(id, (err, user) => {
			if (err) {
				log.saveLog(`Tried to delete a User but got error: ${err.message || ''}`)
				return next(err)
			}

			return res.status(200).send(user)
		})
	}
}

const login = (req, res, next) => {
	const data = req.body

	if (vUserPassword(data)) {
		User.authenticate(data.username, data.password, (err, user) => {
			if (err || !user) {
				const error = new Error('Wrong Username or Password')
				error.status = 401

				log.saveLog(`User ${data.username || ''} tried to login but got error: ${error.message || ''}`)

				return next(error)
			} else {
				log.saveLog('User successfully logged in', user._id)

				req.session.userId = user._id
				return res.redirect(redirectByType(user.type))
			}
		})
	} else {
		const error = new Error('All fields are required to log in')
		error.status = 400

		log.saveLog(`User ${data.username} tried to login but got error: ${error.message || ''}`)

		return next(error)
	}
}

const logout = (req, res, next) => {
	if (req.session) {
		const id = req.session.userId

		req.session.destroy((err) => {
			if (err) {
				log.saveLog(`User tried to logout but got error: ${err.message || ''}`, id)
				return next(err)
			} else {
				log.saveLog('User successfully logged out', id)
				return res.redirect('/')
			}
		})
	}
}

const loadProfile = (userId, res, next, callback) => {
	User.findById(userId)
		.exec(function (err, user) {
			if (err) {
				return next(err)
			} else {
				callback(user)
			}
		})
}

const userProfile = (req, res, next) => {
	loadProfile(req.session.userId, res, next, (user) => {
		if (user === null) {
			var error = new Error('User not authorized. No session detected. ')
			error.status = 403

			log.saveLog(`Someone tried to navigate to /user but got error: ${error.message}`)

			return next(error)
		} else {
			log.saveLog('User successfully navigated to /user', user._id)
			return res.render('user', { user })
		}
	})
}

const adminProfile = (req, res, next) => {
	loadProfile(req.session.userId, res, next, (user) => {
		if (user === null || user.type !== 'admin') {
			var error = new Error('User not authorized to access the Admin dashboard. Please go back')
			error.status = 403

			log.saveLog(`Someone tried to navigate to /admin but got error: ${error.message}`)

			return next(error)
		} else {
			log.getLogs(10, req.params.page, (err, logs) => {
				if (err) return next(err)

				if (logs && logs.list) {
					logs.list.forEach(log => {
						log.timestamp = log.createdAt.toLocaleString('en-US')
					})
				}

				return res.render('admin', { user, logs })
			})
		}
	})
}

module.exports = {
	adminProfile,
	create,
	delt,
	login,
	logout,
	userProfile
}
