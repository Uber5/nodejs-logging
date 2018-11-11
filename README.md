# Opinionated Logging for NodeJS

Setting up logging that is useful and flexible, for both development and production, seems hard.

This is an opinionated approach, with sane defaults, for servers (HTTP or otherwise) written in NodeJS.

# Principles and Settings

- Use `console.log` as you wish in development, but (by default) suppress its output in production (`NODE_ENV === 'production'`).
- In order to see `console.log` output in production, set `WINSTON_LEVEL` to `debug` (which will also enable all [winston](https://www.npmjs.com/package/winston) based `logger.debug()` logs).
- log output in production is into `./app-%date%.log`, no output on the console itself.
- Log output, when not in production, is to the console, nothing written to files.
- In production, an additional file `error-%date%.log` is written with actual errors.
- Files written are limited in size and rotated.
- Files older than 14 days are removed.

# Install

Via npm

```
npm install --save u5-nodejs-logging
```

... or via yarn

```
yarn add u5-nodejs-logging
```

# Logging via Winston

```
const { logger } = require('u5-nodejs-logging')

...
logger.info('successfully saved')
...
```

# Request Logging and Error Handling for ExpressJS

```
const {
  expressLoggingMiddleware, expressErrorHandlingMiddleware
} = require('u5-nodejs-logging')

const app = express()

app.use(expressLoggingMiddleware()) // first middleware
// ... routes etc here, via app.get() etc.
app.use(expressErrorHandlingMiddleware()) // last middleware
app.listen(process.env.PORT || 3000)
```
