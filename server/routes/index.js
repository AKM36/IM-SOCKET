const jwt = require('jsonwebtoken')
const config = require('../config')
const redis = require('../redis')
const logger = require('../logger')
const { errcode } = require('../utils')
module.exports = (router) => {
  require('./sign')(router)
  router.use((req, res, next) => {
    // .. some logic here .. like any other middleware
    let token = req.headers['x-requested-token']
    logger.getLogger('router').debug('ip---' + req.ip)
    logger.getLogger('router').debug('url---' + req.url)
    logger.getLogger('router').debug('token---' + token)
    if (!token) {
      logger.getLogger('router').error('无效的签名！')
      res.status(401).send({ code: errcode.Unauthorized, error: '无效的签名！' })
    } else {
      jwt.verify(token, config.jwt.secret, async (err, suid) => {
        if (err) {
          logger.getLogger('router').error('无效的签名！')
          res.status(401).send({ code: errcode.Unauthorized, error: '无效的签名！' })
        } else {
          let expires = await redis.ttl(config.jwt.tokenKey + ":" + suid)
          if (expires > 100) {
            redis.expire(config.jwt.tokenKey + ":" + suid, config.jwt.expires)
            req.suid = suid
            next()
          } else {
            logger.getLogger('router').error('签名已过期，请重新获取！')
            res.status(401).send({ code: errcode.Authorization_Expired, error: '签名已过期，请重新获取！' })
          }
        }
      })
    }
  });
  require('./qiniu')(router)
  require('./message')(router)
  require('./group')(router)
  require('./user')(router)
  return router
}
