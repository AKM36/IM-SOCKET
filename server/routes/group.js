const User = require('../models/user')
const Group = require('../models/group')
const logger = require('../logger')
const { assert,errcode } = require('../utils')
module.exports = function (router) {
  //创建群组
  router.post('/chat/group/creat', async (req, res, next) => {
    let params = req.body
    let suid = req.suid
    let members = params.members
    let groupName = params.name
    logger.getLogger('group').debug('创建群组:SUID-' + suid)
    assert(members.length === 0, errcode.Bad_Request, '群组成员不可为空！')
    assert(!groupName, errcode.Bad_Request, '群组名称不可为空！')
    //获取当前用户信息
    let suser = await User.findById(suid)
    //获取渠道ID
    let tenantid = suser.tenantid
    //生成批量人员创建数组
    let promises = members.map(user => {
      return User.findOrCreate({
        tenantid: tenantid,
        uid: user.uid,
        nickname: user.nickname,
        avatarfileurl: user.avatarfileurl
      })
    })
    //批量执行
    let tusers = await Promise.all(promises)
    //循环生成的人员提取用户ID
    members = tusers.map(user => { return user.id })
    //创建群组
    let group = await Group.findByMembersOrCreate({
      creator: suser.id,
      name: groupName,
      remark: groupName,
      members: members
    })
    res.send({
      group
    })
  })
  //获取群主成员
  router.get('/chat/group/members', async (req, res, next) => {
    let params = req.query
    let groupid = params.groupid
    logger.getLogger('group').debug('获取群组成员:SUID-' + req.suid)
    assert(!groupid, errcode.Bad_Request, '群组ID不可为空！')
    let members = await Group.findMembers(groupid)
    res.send(members)
  })
  //修改群组名称
  router.post('/chat/group/eidtName', async (req, res, next) => {
    let params = req.body
    let groupid = params.groupid
    let name = params.name || ""
    logger.getLogger('group').debug('修改群组名称:SUID-' + req.suid)
    assert(!groupid, errcode.Bad_Request, '群组ID不可为空！')
    let group = await Group.findByIdAndUpdate(groupid, { name: name })
    res.send(group)
  })
  //修改群组头像
  router.post('/chat/group/eidtAvatar', async (req, res, next) => {
    let params = req.body
    let avatarfileurl = params.avatarfileurl
    let name = params.name || ""
    logger.getLogger('group').debug('修改群组头像:SUID-' + req.suid)
    assert(!avatarfileurl, errcode.Bad_Request, '头像地址不可为空！')
    let group = await Group.findByIdAndUpdate(groupid, { avatarfileurl: avatarfileurl })
    res.send(group)
  })
}
