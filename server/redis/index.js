const config = require('../config')
const ioredis = require('ioredis')
const redis = new ioredis(config.redis)
module.exports = redis
