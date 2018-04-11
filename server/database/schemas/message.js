'use strict';

const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

const MsgSchema = new Mongoose.Schema({
  groupid: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: Number,
    enum: [0, 1, 2, 1000],
    default: 0
  },
  len: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    default: ''
  },
  crtdate: {
    type: Number,
    default: ''
  },
  recall: {
    type: Boolean,
    default: false
  },
  del: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})


// Create a user model
const MsgModel = Mongoose.model('Msg', MsgSchema)

module.exports = MsgModel
