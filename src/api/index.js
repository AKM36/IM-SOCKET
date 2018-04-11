import axios from 'axios'
import Vue from 'vue'
let axiosIns = axios.create({})
// axios 配置
axiosIns.defaults.timeout = 5000
// axiosIns.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
axiosIns.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
if (process.env.NODE_ENV === 'development') {
  axiosIns.defaults.baseURL = 'http://192.168.188.160:3000/'
} else if (process.env.NODE_ENV === 'testing') {
  axiosIns.defaults.baseURL = 'http://localhost:8080/'
} else if (process.env.NODE_ENV === 'production') {
  axiosIns.defaults.baseURL = window.baseURL
}

axiosIns.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
axiosIns.defaults.headers.get['X-Requested-With'] = 'XMLHttpRequest'
axiosIns.defaults.responseType = 'json'
axiosIns.defaults.transformRequest = [function (data) {
  // 数据序列化
  return JSON.stringify(data)
}
]
axiosIns.defaults.validateStatus = function (status) {
  return status >= 200 && status < 300;
}
axiosIns.interceptors.request.use(function (config) {
  // 配置config
  config.headers.Accept = 'application/json'
  let token = window.localStorage.getItem("access-token");
  if (token) {
    config.headers['X-Requested-Token'] = token;
  }
  return config
})
axiosIns.interceptors.response.use(function (response) {
  let status = response.status
  if (status === 200) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(response)
  }
})

let makeRequest = function (req) {
  return axiosIns[req.type](req.url, req.data || {}, req.config)
}

let ajaxMethod = ['get', 'post']
let api = {
  all: function (reqs) {
    let requests = reqs.map(makeRequest)
    return new Promise(function (resolve, reject) {
      axios.all(requests)
        .then(axios.spread(function () {
          let args = [].slice.call(arguments)
          let res = []
          let isAll = true
          args.forEach(function (response) {
            if (response.data.header.errcode === '0000000000') {
              res.push(response.data.data)
            } else if (response.data.header.errcode === '0000000008') {
              Vue.prototype.$message.error(response.data.header.errmsg)
            } else {
              isAll = false
              Vue.prototype.$message.error(response.data.header.errmsg)
            }
          })
          if (isAll) {
            resolve(res)
          }
        })).catch((err) => {
          if (err.response) {
            console.log(err.response.data.error)
          } else {
            console.log(err.message)
          }
          // Vue.prototype.$message.error('服务器异常，请稍后再试！')
        })
    })
  }
}
ajaxMethod.forEach((method) => {
  // 数组取值的两种方式
  api[method] = function (uri, data, config) {
    return new Promise(function (resolve, reject) {
      if (method === "get") data = {
        params: data
      }
      axiosIns[method](uri, data, config).then((response) => {
        resolve(response.data)
        // if (response.data.header.errcode === '0000000000') {
        //   resolve(response.data.data)
        // } else if (response.data.header.errcode === '0000000008') {
        //   Vue.prototype.$message.error(response.data.header.errmsg)
        // } else if (response.data.header.errcode === '0500000001') {
        //   reject('登录名或登录密码不正确')
        // } else {
        //   Vue.prototype.$message.error(response.data.header.errmsg)
        // }
      }).catch((err) => {
        if (err.response) {
          console.log(err.response.data.error)
        } else {
          console.log(err.message)
        }
        // Vue.prototype.$message.error('服务器异常，请稍后再试！')
      })
    })
  }
})

export const get = api['get']
export const post = api['post']
export default function (Vue, options = {}) {
  Vue.prototype.$api = api
}
