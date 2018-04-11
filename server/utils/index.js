
const logger = require('../logger')
const errcode = require('./errcode')
const evecode = require('./evecode')
const assert = (result, status, message, code) => {
  if (result) {
    let err = new Error(message)
    err.status = status
    err.code = code || status
    throw err;
  }
}

const sAssert = (result, msg, socket, code) => {
  if (result) {
    logger.getLogger('socket').error("suid:" + socket.suid + "-" + socket.nickname + "--发生异常：" + msg)
    socket.error({
      message: msg,
      code: code || errcode.Bad_Request
    })
    return false
  }
  return true
}

module.exports = {
  assert,
  sAssert,
  errcode,
  evecode
}
