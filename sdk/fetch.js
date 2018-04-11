
let token = ''
let apiUrl = ''
let errorhandler = () => { }

const headers = {
  GET: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
  },
  POST: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
  }
}
/**
 * 将对象转成 a=1&b=2的形式
 * @param obj 对象
 */
const obj2String = (obj, arr = [], idx = 0) => {
  for (let item in obj) {
    arr[idx++] = [item, obj[item]]
  }
  return new URLSearchParams(arr).toString()
}
const _typeof = (obj) => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}
const isPlainObject = (obj) => {
  return _typeof(obj) === 'object'
}

const checkStatus = (config, response) => {
  if (response.ok) {
    return response.json()
  } else if (response.status == 401 || response.status == 400) {
    return response.json()
      .then(err => {
        let error = new Error(err.error)
        error.config = config
        error.response = response
        error.code = err.code
        error.date = err
        error.type = response.status == 401 ? 'Unauthorized' : 'Bad Request'
        throw error
      })
  }
  const error = new Error(response.statusText)
  error.response = response
  throw error
}

const request = (url, config) => {
  let header = {
    'X-Requested-Token': token
  }
  Object.assign(header, headers[config.method])
  config.headers = new Headers(header)
  return new Promise(function (resolve, reject) {
    fetch(url, config)
      .then(response => {
        config.url = url
        return checkStatus(config, response)
      })
      .then(data => {
        resolve(data)
      })
      .catch(err => {
        reject(err)
        errorhandler(err)
      })
  })
}

/**
 * GET请求
 * @param url 请求地址
 * @param params 请求参数
 */
const get = (url, params) => {
  if (params && isPlainObject(params)) {
    let searchStr = obj2String(params)
    url += '?' + searchStr
  }
  return request(apiUrl + url, {
    method: 'GET'
  })
}

/**
 * POST请求
 * @param url 请求地址
 * @param params 请求参数
 */
const post = (url, params) => {
  return request(apiUrl + url, {
    method: 'POST',
    body: JSON.stringify(params)
  })
}

const init = (url, tokenn) => {
  token = tokenn
  apiUrl = url
}

const error = callback => {
  errorhandler = callback
}

export {
  init,
  error,
  post,
  get
}
