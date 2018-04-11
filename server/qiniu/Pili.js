const Pili = require('piliv2')

const ACCESS_KEY = 'QiniuAccessKey'
const SECRET_KEY = 'QiniuSecretKey'

const HUB = 'PiliHubName'; // The Hub must be exists before use

var credentials = new Pili.Credentials(ACCESS_KEY, SECRET_KEY)
