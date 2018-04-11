const User = require('../models/user')
const Group = require('../models/group')
const Msg = require('../models/message')
const logger = require('../logger')
const { assert } = require('../utils')
module.exports = (router) => {
  //获取当前登录人员信息
  router.get('/chat/user/info', async (req, res, next) => {
    let suid = req.suid
    logger.getLogger('user').debug('获取用户信息：SUID-' + suid)
    let suser = await User.findById(suid)
    res.send(suser)
  })
  //获取当前登录人员群组列表
  router.get('/chat/user/groups', async (req, res, next) => {
    let suid = req.suid
    logger.getLogger('user').debug('获取群组列表：SUID-' + suid)
    let suser = await User.findById(suid)
    let groupids = suser.groups.map(group => { return group.groupid })
    let groups = await Group.query({ '_id': { $in: groupids } })
    res.send(groups)
  })
}
