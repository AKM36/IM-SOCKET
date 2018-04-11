const logger = require('../logger')
const Msg = require('../models/message')
const { sAssert } = require('../utils')
module.exports = (chat, socket) => {
  //接收消息
  socket.on('send', async msg => {
    if (!sAssert(!msg, '接收消息，消息不可为空', socket)) return
    if (!sAssert(!msg.groupid, '接收消息，群组ID不可为空', socket)) return
    if (!sAssert(!msg.content, '接收消息，消息内容不可为空', socket)) return
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "发送消息：" + msg.content)
    msg.creator = socket.suid
    let res = await Msg.create(msg)
    chat.to(msg.groupid).emit("msgreceive", res)
  })
  //插销消息
  socket.on('msgcancel', async msg => {
    if (!sAssert(!msg, '撤销消息，消息不可为空', socket)) return
    if (!sAssert(!msg.msgid, '撤销消息，消息ID不可为空', socket)) return
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "撤销消息")
    let msgid = msg.msgid
    await Msg.findByIdAndUpdate(msgid, {
      recall: true
    })
    chat.to(msg.groupid).emit("msgcancel", msgid)
  })
}
