
const Group = require('../database').models.group
const User = require('./user')
const logger = require('../logger')

const populate = [{
  path: 'creator',
  select: '_id nickname avatarfileurl'
}]

const create = (params) => {
  return new Promise((resolve, reject) => {
    let group = new Group(params)
    group.save((err, doc) => {
      if (err) {
        reject(err)
      }
      doc.populate(populate, function (err, data) {
        resolve(data)
      })
    })
  })
};

const query = (params) => {
  return new Promise((resolve, reject) => {
    Group.find(params)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
  })
}

const findOne = (params) => {
  return new Promise((resolve, reject) => {
    Group.findOne(params)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
  })
}

const findById = (id) => {
  return new Promise((resolve, reject) => {
    Group.findById(id)
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
  })
}

const findByIdAndUpdate = (id, params) => {
  return new Promise((resolve, reject) => {
    Group.findByIdAndUpdate(id, params, { new: true })
      .populate('creator', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        resolve(doc)
      })
  })
}

const findByMembersOrCreate = async (params) => {
  //根据群组成员查找群主
  let group = await findOne({
    members: {
      "$size": params.members.length,
      "$all": params.members
    }, state: 0
  })
  if (!group) {//不存在则创建
    logger.getLogger('group').debug("suid:" + params.creator + '：新创建群组')
    //排除创建人自身
    let members = params.members.filter(member=>{
      if(member==params.creator){
        logger.getLogger('group').error("suid:" + params.creator + "新创建群组包含自身，已排除！")
      }
      return member!=params.creator
    })
    let groupData = {
      creator: params.creator,
      name: params.name,
      remark: params.remark,
      state: 0,
      members: members,
      crtdate: new Date().getTime(),
      atchments: []
    };
    group = await create(groupData)
    params.members.push(params.creator)
    let promises = params.members.map(suid => {
      return User.findByIdAndUpdate(suid, {
        $addToSet: {
          groups: {
            groupid: group.id,
            joindate: new Date().getTime()
          }
        }
      })
    })
    await Promise.all(promises)
  } else {
    logger.getLogger('group').debug("suid:" + params.creator + '群主ID：' + group.id + '--群组已存在')
  }
  return group
}

const addMember = async (users, groupid) => {
  let members = users.map(user => { return user.id })
  await Group.findByIdAndUpdate(groupid, {
    $addToSet: {
      members: { $each: members }
    }
  })

  let promises = users.map(user => {
    return User.findByIdAndUpdate(user.id, {
      $addToSet: {
        groups: {
          groupid: groupid,
          joindate: new Date().getTime()
        }
      }
    })
  })
  await Promise.all(promises)
}

const removeMember = async (suid, groupid) => {
  let group = await findByIdAndUpdate(groupid, {
    $pull: {
      members: suid
    }
  })
  await User.findByIdAndUpdate(suid, {
    $pull: {
      groups: {
        groupid: groupid
      }
    }
  })
  return group
}

const findMembers = async (groupid) => {
  return new Promise((resolve, reject) => {
    Group.findById(groupid)
      .populate('creator members', '_id nickname avatarfileurl')
      .exec((err, doc) => {
        if (err) {
          reject(err)
        }
        doc.members.unshift(doc.creator)
        resolve(doc.members)
      })
  })
}

module.exports = {
  query,
  findOne,
  findById,
  findMembers,
  findByIdAndUpdate,
  findByMembersOrCreate,
  addMember,
  removeMember
};
