'use strict';

const Msg = require('../database').models.message;

const populate = [{
  path: 'creator',
  select: '_id nickname avatarfileurl'
}]
const create = (params) => {
  return new Promise((resolve, reject) => {
    let msgData = {
      creator: params.creator,
      groupid: params.groupid,
      len: params.len,
      type: params.type,
      content: params.content,
      crtdate: new Date().getTime(),
      del: []
    }
    let msg = new Msg(msgData)
    msg.save((err, doc) => {
      if (err) {
        reject(err)
      }
      doc.populate(populate, function (err, data) {
        resolve(data)
      })
    })
  })
}

const findOne = (params) => {
  return new Promise((resolve, reject) => {
    Msg.findOne(params)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
  })
}

const findById = (id) => {
  return new Promise((resolve, reject) => {
    Msg.findById(id)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
  })
}

const query = (params) => {
  return new Promise((resolve, reject) => {
    Msg.find(params)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      });
  })
}

const history = (params) => {
  return new Promise((resolve, reject) => {
    Msg.find({ groupid: params.groupid, crtdate: { "$gte": params.joindate } })
      .skip((params.page - 1) * params.perpage)
      .limit(params.perpage + 1)
      .populate('creator', '_id nickname avatarfileurl')
      .sort({ '_id': -1 })
      .exec((err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      });
  })
}

const findByIdAndUpdate = (id, params) => {
  return new Promise((resolve, reject) => {
    Msg.findByIdAndUpdate(id, params)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
  })
}


module.exports = {
  create,
  query,
  findOne,
  findById,
  history,
  findByIdAndUpdate
}
