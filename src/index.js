const util = require('util')
const morgan = require('morgan')
const winston = require('winston')

require('winston-daily-rotate-file')

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

const transports = process.env.NODE_ENV === 'production' ? [
  // production
  new (winston.transports.DailyRotateFile)({
    filename: 'error-%DATE%.log',
    // datePattern: 'YYYY-MM-DD-HH',
    // zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
  }),
  new (winston.transports.DailyRotateFile)({
    filename: 'app-%DATE%.log',
    // datePattern: 'YYYY-MM-DD-HH',
    // zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  })
] : [
  // not production
  new winston.transports.Console({
    format: winston.format.simple()
  })
]

const logger = winston.createLogger({
  level: process.env.WINSTON_LEVEL || 'info',
  format: winston.format.combine(errorStackFormat(), winston.format.json()),
  transports
});
 
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
