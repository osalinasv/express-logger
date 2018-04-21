const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true,
	},
	type: {
		type: String,
		required: true,
		default: 'user',
		trim: true,
	},
	password: {
		type: String,
		required: true,
	}
})

UserSchema.pre('save', function (next) {
	var user = this

	bcrypt.hash(user.password, SALT_ROUNDS, (err, hash) => {
		if (err) return next(err)

		user.password = hash
		next()
	})
})

UserSchema.statics.authenticate = function (username, password, callback) {
	User.findOne({ username: username })
		.exec((err, user) => {
			if (err) {
				return callback(err)
			} else if (!user) {
				var err = new Error('User not found.')
				err.status = 401

				return callback(err)
			}

			bcrypt.compare(password, user.password, function (err, result) {
				if (result === true) {
					return callback(null, user)
				} else {
					return callback()
				}
			})
		})
}

const User = mongoose.model('user', UserSchema)

module.exports = User
