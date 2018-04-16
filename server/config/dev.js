'use strict'
const ms = require("ms")
module.exports = {
  port: 3000,
  socket: {
    port: 3131,
    uri: 'http://192.168.188.160:3131'
  },
  proxy: {
    uri: 'http://192.168.188.160:3000/'
  },
  jwt: {
    tokenKey: "SOCKET:TOKEN",
    secret: 'SECRET',
    expires: ms('7day')
  },
  signurl: '',//签名获取地址
  wxsignurl: '',//微信文件下载签名地址
  database: {
    uri: ''
  },
  qiniu: {
    tokenKey: "QINIU:TOKEN",
    expires: ms('2h'),
    bucket: '',
    uri: '',
    ACCESS_KEY: '',
    SECRET_KEY: ''
  },
  redis: {
    port: 6379, // Redis port
    host: '', // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    password: '',
    db: ''
  },
  logger: {
    pm2: true,
    pm2InstanceVar: 'INSTANCE_ID',
    appenders: {
      debug: {
        type: "console"
      }
    },
    categories: {
      default: {
        appenders: [
          "debug"
        ],
        level: "debug"
      },
      http: {
        appenders: [
          "debug"
        ],
        level: "all"
      }
    }
  }
}
