'use strict';

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const UserGroupSchema = new Mongoose.Schema({
  groupid:
    {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  state: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  joindate: {
    type: Number,
    default: ""
  },
  outdate: {
    type: Number,
    default: ""
  }
})

const UserSchema = new Mongoose.Schema({
  tenantid: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    default: ''
  },
  nickname: {
    type: String,
    default: ''
  },
  avatarfileurl: {
    type: String,
    default: ''
  },
  groups: [UserGroupSchema],
  crtdate: {
    type: Number,
    default: ''
  }
})


// Create a user model
const UserModel = Mongoose.model('User', UserSchema)

module.exports = UserModel
