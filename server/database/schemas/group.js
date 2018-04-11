'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const AtchmentSchema = new Mongoose.Schema(
  {
    attr: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0
    },
    content: {
      type: String,
      default: ''
    }
  })

const GroupSchema = new Mongoose.Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  avatarfileurl: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  remark: {
    type: String,
    default: ''
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  state: {
    type: Number,
    enum: [0, 1, 2],
    default: 0
  },
  atchments: [AtchmentSchema],
  crtdate: { type: Number, default: '' }
});

const GroupModel = Mongoose.model('Group', GroupSchema)

module.exports = GroupModel
