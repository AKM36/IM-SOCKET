const config = require('../config')
const Mongoose = require('mongoose')
const logger = require('../logger')
// 创建客户端连接对象
if (config.database.config) {
  Mongoose.connect(config.database.uri, config.database.config, (err) => {
    if (err) {
      logger.getLogger('database').error(err.stack)
      if (err) throw err;
    } else {
      logger.getLogger('database').debug("创建数据库连接成功")
    }
  })
} else {
  Mongoose.connect(config.database.uri, (err) => {
    if (err) {
      logger.getLogger('database').error(err.stack)
      if (err) throw err;
    } else {
      logger.getLogger('database').debug("创建数据库连接成功")
    }
  })
}

// Throw an error if the connection fails
Mongoose.connection.on('error', (err) => {
  logger.getLogger('database').error(err.stack)
  Mongoose.disconnect();
  if (err) throw err;
})

module.exports = {
  Mongoose,
  models: {
    user: require('./schemas/user.js'),
    group: require('./schemas/group.js'),
    message: require('./schemas/message.js')
  }
};
