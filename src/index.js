const util = require('util')
const morgan = require('morgan')
const winston = require('winston')

const errorStackFormat = winston.format(info => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message
    })
  }
  return info
})

// TODO: depending on environment, we could define other transports, e.g.
// logging to ELK or elsewhere.

const logger = winston.createLogger({
  level: process.env.WINSTON_LEVEL || 'info',
  format: winston.format.combine(errorStackFormat(), winston.format.json()),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
 
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const originalLog = console.log
console.log = function() {
  if (process.env.NODE_ENV === 'production') {
    logger.debug(util.format.apply(this, arguments))
  } else {
    originalLog.apply(this, arguments)
  }
}

const expressLoggingMiddleware = () => {
  const morganMiddleware = morgan('combined')
  return [ morganMiddleware ] // TODO: could add more middleware here
}

const expressErrorHandlingMiddleware = () => {
  return (err, req, res, next) => {
    logger.error(err)
    throw err
  }
}

module.exports = {
  expressLoggingMiddleware,
  expressErrorHandlingMiddleware,
  logger
}
