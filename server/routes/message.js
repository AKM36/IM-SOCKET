const request = require('superagent')
const md5 = require('md5')
const moment = require('moment')
const config = require('../config')
const Group = require('../models/group')
const Msg = require('../models/message')
const User = require('../models/user')
const qiniu = require('../qiniu')
const logger = require('../logger')
const { assert, errcode } = require('../utils')
module.exports = (router) => {
  router.post('/chat/message/history', async (req, res, next) => {
    let { params, suid } = req
    let { groupid, page, perpage } = params
    logger.getLogger('message').debug('获取历史消息:SUID-' + suid)
    assert(!groupid, errcode.Bad_Request, '群组ID不可为空！')
    let suser = await User.findOne({
      _id: suid,
      "groups.groupid": groupid
    })
    assert(!suser, errcode.Bad_Request, '非法操作，您不属于该群成员！')
    let joindate = suser.groups[0].joindate
    let msgs = await Msg.history({
      groupid: groupid,
      page: page,
      perpage: perpage,
      joindate: joindate
    })
    res.send(msgs)
  })
  router.post('/chat/message/delete', async (req, res, next) => {
    let params = req.body
    let suid = req.suid
    let msgids = params.msgids
    assert(!msgids || msgids.length == 0, errcode.Bad_Request, '删除消息数组不可为空！')
    logger.getLogger('message').debug('删除消息:SUID-' + suid)
    let msgs = await Msg.query({ '_id': { $in: msgids } })
    msgs.forEach(msg => {
      msg.del.push(suid)
      msg.save()
    })
    res.send(msgids)
  })
  router.post('/chat/message/image', async (req, res, next) => {
    let params = req.body
    let suid = req.suid
    let serverid = params.serverid
    logger.getLogger('message').debug('上传图片:SUID-' + suid)
    assert(!serverid, errcode.Bad_Request, '图片ID不可为空！')
    let token = await request.get(config.wxsignurl)
    let sres = await request.get('https://api.weixin.qq.com/cgi-bin/media/get?access_token=' + token.text + '&media_id=' + serverid)
    let filename = 'im/' + moment().format('YYMMDD') + '/p/' + md5(sres.body) + '.jpg'
    let url = await qiniu.uploadFile(filename, sres.body)
    res.send({
      url
    })
  })
  router.post('/chat/message/voice', async (req, res, next) => {
    let params = req.body
    let suid = req.suid
    let serverid = params.serverid
    logger.getLogger('message').debug('上传音频:SUID-' + suid)
    assert(!serverid, errcode.Bad_Request, '语音ID不可为空！')
    let token = await request.get(config.wxsignurl)
    let sres = await request.get('https://api.weixin.qq.com/cgi-bin/media/get?access_token=' + token.text + '&media_id=' + serverid).responseType("blob")//.buffer(false)
    let path = await qiniu.uploadVoiceFile(sres.body)
    res.send(path)
  })
}
