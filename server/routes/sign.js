const jwt = require('jsonwebtoken')
const request = require('superagent')
const config = require('../config')
const User = require('../models/user')
const redis = require('../redis')
const logger = require('../logger')
const { assert,errcode } = require('../utils')
module.exports = (router) => {
  router.post('/chat/sign', async (req, res, next) => {
    let params = req.body
    logger.getLogger('sign').debug(params.appKey + '-用户：UID-' + params.userId + "获取token")
    let sres = await request.post(config.signurl)
      .timeout(5000)
      .set('Content-Type', 'application/json;charset=UTF-8')
      .send(params)
    if (sres.body.header.errcode == "0000000000" && sres.body.data) {
      let suser = await User.findOrCreate({
        tenantid: params.appKey,
        uid: params.userId,
        nickname: params.nmSur,
        avatarfileurl: params.headerUrl
      })
      let token = jwt.sign(suser.id, config.jwt.secret)
      let oldToken = await redis.get(config.jwt.tokenKey + ":" + suser.id)
      if (oldToken) {
        redis.del(config.jwt.tokenKey + ":" + suser.id)
      }
      redis.set(config.jwt.tokenKey + ":" + suser.id, token, 'EX', config.jwt.expires)
      res.send({
        token
      })
    } else {
      logger.getLogger('sign').error(params.appKey + '-用户：UID-' + params.userId + ":" + sres.body.header.errmsg)
      assert(true, errcode.Bad_Request, sres.body.header.errmsg, errcode.Authorization_Exception)
    }
  })
  let num = 1
  router.get('/chat/sign', async (req, res, next) => {
    let suser = await User.findOrCreate({
      tenantid: 'eyJhbGciOiJIUzI1NiJ9',
      uid: num++ + '00000000',
      nickname: '测试--' + num++ + '0000',
      avatarfileurl: 'http://img2.imgtn.bdimg.com/it/u=3802506693,1778634825&fm=27&gp=0.jpg'
    })
    let token = jwt.sign(suser.id, config.jwt.secret)
    let oldToken = await redis.get(config.jwt.tokenKey + ":" + suser.id)
    if (oldToken) {
      redis.del(config.jwt.tokenKey + ":" + suser.id)
    }
    redis.set(config.jwt.tokenKey + ":" + suser.id, token, 'EX', config.jwt.expires)
    res.send({
      token
    })
  })
  router.get('/chat/user/all', async (req, res, next) => {
    let users = await User.query()
    res.send(users)
  })
}
