const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressSanitizer = require('express-sanitizer')

const cleanup = require('./middlewares/cleanup')

const dotenv = require('dotenv')
dotenv.load()

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const db = require('./db')
const app = express()

app.use(session({
	secret: 'work hard',
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressSanitizer())
app.use(cookieParser())

app.use(cleanup)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index'))
app.use('/api/user', require('./routes/users'))
app.use('/api/log', require('./routes/logs'))

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const error = new Error('Not Found')
	error.status = 404

	next(error)
})

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
