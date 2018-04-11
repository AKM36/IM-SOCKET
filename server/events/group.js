const logger = require('../logger')
const Group = require('../models/group')
const User = require('../models/user')
const Msg = require('../models/message')
const redis = require('../redis')
const { sAssert } = require('../utils')
module.exports = (chat, socket) => {
  //进入群组
  socket.on('joingroup', async msg => {
    if (!sAssert(!msg, '加入群组，消息不可为空', socket)) return
    if (!sAssert(!msg.groupid, '加入群组，群组ID不可为空', socket)) return
    socket.join(msg.groupid)
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "加入聊天")
    chat.to(msg.groupid).emit("msgreceive", {
      type: 10000,
      groupid: msg.groupid,
      content: socket.nickname + "加入聊天",
      crtdate: new Date().getTime()
    })
  })
  //添加成员，被管理员加入
  socket.on('addmember', async msg => {
    if (!sAssert(!msg, '添加成员，消息不可为空', socket)) return
    if (!sAssert(!msg.users || msg.users.length == 0, '添加成员，人员信息不可为空', socket)) return
    if (!sAssert(!msg.groupid, '添加成员，群组ID不可为空', socket)) return
    let users = msg.users
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "添加群组成员")
    //查找群组对象
    let group = await Group.findById(msg.groupid)
    if (group.creator.id != socket.suid) {
      logger.getLogger('socket').error("suid:" + socket.suid + "-" + socket.nickname + "添加成员没有权限")
      socket.emit('systemmsg', '操作失败！您没有权限！')
      return
    }

    let promises = users.map(user => {
      return User.findOrCreate({
        tenantid: socket.tenantid,
        uid: user.uid,
        nickname: user.nickname,
        avatarfileurl: user.avatarfileurl
      })
    })
    //批量执行
    let tusers = await Promise.all(promises)
    //排除创建人自身
    let members = tusers.filter(user=>{
      if(user.id==group.creator.id){
        logger.getLogger('socket').error("suid:" + socket.suid + "-" + socket.nickname + "添加成员包含自身，已排除！")
      }
      return user.id!=group.creator.id
    })
    Group.addMember(members, msg.groupid)

    members.map(async user => {
      //根据suid获取socket连接
      let socketid = await redis.get("IM:SOCKET:ID:" + user.id)
      if (socketid) {
        //通过广播查找该新加成员在多节点中是否存在socket连接，存在则将该socket连接加入房间，并触发该连接的对应事件
        chat.adapter.customRequest({
          evt: 'memberadd',
          groupid: msg.groupid,
          nickname: socket.nickname,
          socketid: socketid
        }, () => {
          //房间内广播加入成员事件
          chat.to(msg.groupid).emit("msgreceive", {
            type: 10000,
            suid: user.id,
            groupid: msg.groupid,
            content: user.nickname + "加入群组",
            crtdate: new Date().getTime()
          })
        })
      }
    })
  })

  //主动退出群组
  socket.on('outgroup', async msg => {
    if (!sAssert(!msg, '退出群组，消息不可为空', socket)) return
    if (!sAssert(!msg.groupid, '退出群组，群组ID不可为空', socket)) return
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "退出群组-" + msg.groupid)
    //查找群组对象
    let group = await Group.findById(msg.groupid)
    if (group.creator.id == socket.suid) {//如果是群组本人无法退出
      logger.getLogger('socket').error("suid:" + socket.suid + "-" + socket.nickname + "群主无法退出")
      socket.emit('systemmsg', '操作失败！群主无法退出！')
      return
    }
    //从群组对象删除该成员ID
    Group.removeMember(socket.suid, msg.groupid)
    //sokect连接退出该房间ID
    socket.leave(msg.groupid)
    //触发该连接对象的退出事件
    socket.emit('groupout', {
      type: 10000,
      groupid: msg.groupid,
      suid: socket.suid,
      content: "您已退出群组",
      crtdate: new Date().getTime()
    })
    //向该房间广播退出消息
    chat.to(msg.groupid).emit("msgreceive", {
      type: 10000,
      groupid: msg.groupid,
      content: socket.nickname + "退出群组",
      crtdate: new Date().getTime()
    })
  })
  //删除群组成员
  socket.on('removemember', async msg => {
    if (!sAssert(!msg, '删除成员，消息不可为空', socket)) return
    if (!sAssert(!msg.suid, '删除成员，人员ID不可为空', socket)) return
    if (!sAssert(!msg.groupid, '删除成员，群组ID不可为空', socket)) return
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "删除群组成员")
    let suid = msg.suid
    let group = await Group.findById(msg.groupid)
    if (group.creator.id != socket.suid) {
      logger.getLogger('socket').error("suid:" + socket.suid + "-" + socket.nickname + "删除成员没有权限")
      socket.emit('systemmsg', '操作失败！您没有权限！')
      return
    }
    if (suid == socket.suid) {
      logger.getLogger('socket').error("suid:" + socket.suid + "-" + socket.nickname + "非法操作，无法删除自己！")
      socket.emit('systemmsg', '非法操作，无法删除自己！')
      return
    }
    Group.removeMember(suid, msg.groupid)
    let suser = await User.findById(suid)
    logger.getLogger('socket').debug("suid:" + suid + "-" + suser.nickname + "被踢出群组-" + msg.groupid)

    let socketid = await redis.get("IM:SOCKET:ID:" + suid)
    if (socketid) {
      chat.adapter.customRequest({
        evt: 'memberremove',
        groupid: msg.groupid,
        nickname: socket.nickname,
        socketid: socketid
      }, () => {
        chat.to(msg.groupid).emit("msgreceive", {
          type: 10000,
          suid: suid,
          groupid: msg.groupid,
          content: suser.nickname + "被" + socket.nickname + "踢出群组",
          crtdate: new Date().getTime()
        })
      })
    }
  })
  //关闭群组
  socket.on('closegroup', async msg => {
    if (!sAssert(!msg, '关闭群组，消息不可为空', socket)) return
    if (!sAssert(!msg.groupid, '关闭群组，群组ID不可为空', socket)) return
    logger.getLogger('socket').debug("suid:" + socket.suid + "-" + socket.nickname + "关闭群组-" + msg.groupid)
    await Group.findByIdAndUpdate(msg.groupid, {
      state: 1
    })
    msg.type = 10000;
    msg.content = "本次咨询已结束"
    let res = await Msg.create(msg)
    chat.to(msg.groupid).emit("groupclose", res)
  })
}
