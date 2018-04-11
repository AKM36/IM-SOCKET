
const User = require('../database').models.user

const create = (params) => {
  return new Promise((resolve, reject) => {
    let user = new User(params);
    user.save((err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

const query = (params) => {
  return new Promise((resolve, reject) => {
    User.find(params)
      .exec((err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      });
  })
}

const findOne = (params) => {
  return new Promise((resolve, reject) => {
    User.findOne(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

const findById = (id) => {
  return new Promise((resolve, reject) => {
    User.findById(id, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

const findOrCreate = async (params) => {
  let user = await findOne({
    tenantid: params.tenantid,
    uid: params.uid
  })
  if (!user) {
    let userData = {
      tenantid: params.tenantid,
      uid: params.uid,
      nickname: params.nickname,
      avatarfileurl: params.avatarfileurl,
      crtdate: new Date().getTime()
    }
    user = await create(userData)
  }
  return user
}

const findByIdAndUpdate = (id, params) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(id, params, { new: true }, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

module.exports = {
  query,
  findOne,
  findById,
  findOrCreate,
  findByIdAndUpdate
};
