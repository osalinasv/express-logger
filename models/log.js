const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
	details: {
		type: String,
		required: true,
		trim: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
}, {
	capped: {
		size: 409600,
		max: 200
	},
	timestamps: true
})

const Log = mongoose.model('log', LogSchema)

module.exports = Log
