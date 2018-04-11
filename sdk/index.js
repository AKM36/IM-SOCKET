import { init, error, get, post } from './fetch'
import connection from './connection'
let lsIM = function (params) {
  if (!this || !this instanceof lsIM) {
    return new lsIM(params)
  }
  if (!params.token) {
    throw new Error("token can't be empty");
  }
  if (!params.uri) {
    throw new Error("uri can't be empty");
  }
  if (!params.apiUrl) {
    throw new Error("apiUrl can't be empty");
  }
  init(params.apiUrl, params.token)
  this.conn = connection(params.uri, params.token)
}

lsIM.prototype.errorhandler = callback => {
  error(callback)
}

lsIM.prototype.creatGroup = (name, members) => {
  return post("chat/group/creat", { name, members })
}

lsIM.prototype.imageUp = (serverid) => {
  return post("chat/message/image", { serverid })
}

lsIM.prototype.voiceUp = (serverid) => {
  return post("chat/message/voice", { serverid })
}

lsIM.prototype.historyMsg = (params) => {
  return post("chat/message/history", params)
}

lsIM.prototype.deleteMsg = (msgids) => {
  return post("chat/message/delete", msgids)
}

lsIM.prototype.getUserInfo = () => {
  return get("chat/user/info")
}

lsIM.prototype.getGroups = () => {
  return get("chat/user/groups")
}

lsIM.prototype.getQiniuToken = () => {
  return post("chat/qiniu/token")
}

lsIM.prototype.getMembers = (groupid) => {
  return get("chat/group/members", { groupid })
}

lsIM.prototype.eidtGroupName = (params) => {
  return post("chat/group/eidtName", params)
}

lsIM.prototype.eidtGroupAvatar = (params) => {
  return post("chat/group/eidtAvatar", params)
}

export default lsIM
