const fp = require('lodash/fp')

const cleanString = fp.flow(
	fp.unescape,
	fp.deburr,
	fp.trim
)

const cleanArray = fp.flow(
	fp.remove(fp.isEmpty),
	fp.map(o => {
		if (fp.isString(o)) return cleanString(o)
	})
)

const cleanObject = fp.flow(
	fp.omitBy(fp.isEmpty),
	fp.mapValues(o => {
		if (fp.isObject(o)) return cleanObject(o)
		else if (fp.isString(o)) return cleanString(o)
		else if (fp.isArray(o)) return cleanArray(o)
	})
)

const cleanup = (req, res, next) => {
	req.body = cleanObject(req.body)
	req.query = cleanObject(req.query)

	next()
}

module.exports = cleanup
