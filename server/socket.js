
const ioredis = require('socket.io-redis')
const socketioJwt = require("socketio-jwt")
const redis = require('./redis')
const config = require('./config')
const logger = require('./logger')
const User = require('./models/user')
const Events = require('./events')
const { errcode } = require('./utils')
const port = process.env.NODE_ENV === 'production' ? config.socket.port + parseInt(process.env.INSTANCE_ID) : config.socket.port
const io = require('../modules/socket.io')(port)
io.adapter(ioredis(config.redis))
const chat = io.of('/im')

//注册redis监听
chat.adapter.customHook = async (data, cb) => {
  if (data.socketid) {
    //在各个节点查找socket连接
    let socket = chat.sockets[data.socketid]
    if (socket) {
      if (data.evt === "memberadd") {
        //将该socket连接加入房间
        socket.join(data.groupid)
        //触发该socket连接的加入房间事件
        socket.emit('groupjoin', {
          type: 10000,
          groupid: data.groupid,
          suid: socket.suid,
          content: "您被" + data.nickname + "加入群组",
          crtdate: new Date().getTime()
        })
      } else if (data.evt === "memberremove") {
        //将该socket连接退出房间
        socket.leave(data.groupid)
        //触发该socket连接的退出房间事件
        socket.emit('groupout', {
          type: 10000,
          groupid: data.groupid,
          suid: socket.suid,
          content: "您被" + data.nickname + "踢出群组",
          crtdate: new Date().getTime()
        })
      }
    }
  }
  cb()
}
//// With socket.io >= 1.0 ////
////注册token校验中间件
chat.use(socketioJwt.authorize({
  secret: config.jwt.secret,
  handshake: true,
  success: async (socket, next) => {
    let suid = socket.decoded_token
    //获取token失效时间
    let expires = await redis.ttl(config.jwt.tokenKey + ":" + suid)
    if (expires > 100) {
      //重置token失效时间
      redis.expire(config.jwt.tokenKey + ":" + suid, config.jwt.expires)
      let suser = await User.findById(suid)
      //绑定用户信息
      socket.tenantid = suser.tenantid
      socket.suid = suid
      socket.avatarfileurl = suser.avatarfileurl
      socket.nickname = suser.nickname
      suser.groups.map(group => { socket.join(group.groupid) })
      //根据suid获取socket连接
      let socketid = await redis.get("IM:SOCKET:ID:" + suid)
      if (socketid) {
        redis.del("IM:SOCKET:ID:" + suid)
        let oSocket = chat.sockets[socketid]
        if (oSocket) {
          oSocket.emit('systemmsg', '你的账号在其他地方登陆，连接将被断开！')
          oSocket.disconnect(true)
        }
      }
      //存储socketid
      redis.set("IM:SOCKET:ID:" + suid, socket.id)
      next()
    } else {
      logger.getLogger('socket').error('签名过期:SUID-' + suid)
      let error = new Error("签名过期，请重新获取！")
      error.data = {
        message: "签名过期，请重新获取！",
        code: errcode.Authorization_Expired
      }
      next(error)
    }
  },
  fail: (error, socket, next) => {
    logger.getLogger('socket').error('无效的签名！')
    error.message = "无效的签名"
    error.data = {
      message: "无效的签名",
      code: errcode.Unauthorized
    }
    next(error)
  }
}));
chat.on('connection', (socket) => {
  logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "创建链接成功")
  Events(chat, socket)//注册事件监听
})
