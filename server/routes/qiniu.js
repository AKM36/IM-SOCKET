const qiniu = require('../qiniu')
const logger = require('../logger')
const { assert } = require('../utils')
module.exports = (router) => {
  router.get('/chat/qiniu/token', async (req, res, next) => {
    logger.getLogger('qiniu').debug('获取七牛Token:SUID-' + req.suid)
    let token = await qiniu.uptoken(true)
    res.send({
      uri: qiniu.uri,
      token: token.token,
      expires: token.expires
    })
  })
}
