const config = require('../config')
const path = require('path')
const qiniu = require('qiniu')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const md5 = require('md5')
const moment = require('moment')
const ms = require("ms")
const BufferStream = require('./buffer-stream')
const redis = require('../redis')
const os = require('os')
const bucket = config.qiniu.bucket
const uri = config.qiniu.uri
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY

const formUploader = new qiniu.form_up.FormUploader()
const putExtra = new qiniu.form_up.PutExtra()
//构建上传策略函数
const uptoken = async (ex) => {
  let expires = await redis.ttl(config.qiniu.tokenKey)
  if (expires < 100) {
    let putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket,
      expires: config.qiniu.expires
    })
    let token = putPolicy.uploadToken()
    redis.set(config.qiniu.tokenKey, token, 'EX', config.qiniu.expires)
    if (ex) {
      return {
        token,
        expires: config.qiniu.expires
      }
    } else {
      return token
    }
  } else {
    let token = await redis.get(config.qiniu.tokenKey)
    if (ex) {
      return {
        token,
        expires
      }
    } else {
      return token
    }
  }
}

//构造上传函数
const uploadFile = async (filename, fsStream) => {
  let token = await uptoken()
  return new Promise((resolve, reject) => {
    formUploader.put(token, filename, fsStream, putExtra, function (err, ret) {
      if (!err) {
        // 上传成功， 处理返回值
        resolve(uri + ret.key)
      } else {
        // 上传失败， 处理返回代码
        reject(err)
      }
    })
  })

}

//构造上传函数
const uploadVoiceFile = async (buff) => {
  let data = []
  var readStream = new BufferStream(buff)
  let stream = ffmpeg(readStream)
    .audioCodec('libmp3lame')
    .format('mp3')
    .on('error', err => {
      console.log('An error occurred: ' + err.message)
    })
  stream.setFfmpegPath(ffmpegPath)
  // let ffstream = stream.save('output.mp3')
  let ffstream = stream.pipe()
  ffstream.on('data', chunk => {
    data.push(chunk)
  })
  let token = await uptoken()
  return new Promise((resolve, reject) => {
    ffstream.on('end', () => {
      let fsStream = Buffer.concat(data)
      let filename = 'im/' + moment().format('YYMMDD') + '/r/' + md5(fsStream) + '.mp3'
      formUploader.put(token, filename, fsStream, putExtra, function (err, ret) {
        if (!err) {
          let len = Math.ceil(fsStream.length / 1000)
          if (len > 10) len = 10
          // 上传成功， 处理返回值
          resolve({
            url: uri + ret.key,
            len
          })
        } else {
          // 上传失败， 处理返回代码
          reject(err)
        }
      })
    })
  })
}

module.exports = {
  uri,
  uptoken,
  uploadFile,
  uploadVoiceFile
}
