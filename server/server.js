const argv = require('optimist').argv
const config = require('./config')
const express = require('express')
const logger = require('./logger')
const bodyParser = require('body-parser')
const domainMiddleware = require('domain-middleware');
const app = express()
const routes = require("./routes")
const router = require('express-async-await')(express.Router())
const server = require('http').createServer(app)
app.use(domainMiddleware({
  server: server,
  killTimeout: 30000
}))

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

logger.use(app)

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "x-requested-with, x-requested-token,content-type")
  res.header("Access-Control-Max-Age", 3600)
  res.header("Access-Control-Allow-Methods", "POST,GET")
  res.header("X-Powered-By", 'Tokyo Hot')
  res.header("Content-Type", "application/json;charset=utf-8")
  if (req.method == "OPTIONS") res.send(200)/*让options请求快速返回*/
  else next()
});

app.all('/chat/*', routes(router))
app.use((err, req, res, next) => {
  if (err) {
    logger.getLogger('server').error(err.stack)
    res.status(err.status || 500).send({ code: err.code || 500, error: err.message || '服务器异常，请稍后再试！' })
  } else {
    next()
  }
})
process.on('uncaughtException', function (err) {
  logger.getLogger('server').error(err.stack)
  try {
    var killTimer = setTimeout(function () {
      process.exit(1)
    }, 30000)
    killTimer.unref()

    server.close()
  } catch (err) {
    logger.getLogger('server').error(err.stack)
  }
})

server.listen(config.port, function (err) {
  if (err) {
    logger.getLogger('server').error(err.stack)
    return
  }
})
