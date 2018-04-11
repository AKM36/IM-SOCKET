const redis = require('../redis')
const logger = require('../logger')
module.exports = (chat, socket) => {
  //断开连接
  socket.on('disconnecting', () => {
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "断开连接")
    redis.del("IM:SOCKET:ID:" + socket.suid)
  })
  require('./message')(chat, socket)//注册消息相关事件
  require('./group')(chat, socket)//注册群组相关事件
}
