const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI)
mongoose.Promise = global.Promise

const db = mongoose.connection

db.on('error', console.error.bind(console, 'Connection error on MongoDB:'))
db.once('open', () => console.log('Connected to MongoDB...'))

module.exports = db
