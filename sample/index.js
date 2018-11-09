const express = require('express')
const { expressLoggingMiddleware, expressErrorHandlingMiddleware, logger } = require('../src')

const app = express()

app.use(expressLoggingMiddleware())

app.get('/', (req, res) => {
  logger.info('this is an info level log')
  console.log('this is output directly to the console', { bla: 42 })
  res.send('Hello, world')
})

app.get('/puke', (req, res) => {
  throw new Error('oops')
})

app.use(expressErrorHandlingMiddleware())

app.listen(process.env.PORT || 3000)
