import io from "socket.io-client"

let onEvts = ['connect', 'msgreceive', 'msgcancel', 'groupclose', 'groupout', 'groupjoin', 'error', 'disconnect', 'systemmsg']

let emEvts = ['joingroup', 'addmember', 'outgroup', 'removemember', 'closegroup', 'send', 'msgcancel']

let connection = function (uri, token) {
  if (!this || !this instanceof connection) {
    return new connection(uri, token)
  }
  this.io = io.connect(uri, {
    query: "token=" + token
  })
}

connection.prototype.on = function (evt, callback) {
  if (onEvts.includes(evt)) {
    this.io.on(evt, callback)
  } else {
    throw new Error("No such event  " + evt)
  }
}

connection.prototype.emit = function (evt, params) {
  if (emEvts.includes(evt)) {
    this.io.emit(evt, params)
  } else {
    throw new Error("No such event  " + evt)
  }
}

export default connection
