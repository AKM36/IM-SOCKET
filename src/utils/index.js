import CryptoJS from "lib/crypto"
import Vue from 'vue'

let ua = navigator.userAgent
let isWechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i)
let isIphone = ua.match(/(iPhone\sOS)\s([\d_]+)/)
let isIPad = ua.match(/(iPad).*OS\s([\d_]+)/)
let isIos = isIphone || isIPad
let isAndroid = ua.match(/(Android);?[\s\/]+([\d.]+)?/)

let class2type = {}
let toString = class2type.toString

"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function (name) {
  class2type["[object " + name + "]"] = name.toLowerCase()
})

let type = function (obj) {
  return obj == null ? String(obj) :
    class2type[toString.call(obj)] || "object"
}

let isFunction = function (value) {
  return type(value) == "function"
}

let isString = function (value) {
  return type(value) == "String"
}

let isObject = function (obj) {
  return type(obj) == "object"
}

let isWindow = function (obj) {
  return obj != null && obj == obj.window
}

let isPlainObject = function (obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
}

let isArray = Array.isArray ||
  function (object) {
    return object instanceof Array
  };

let getQueryString = function (name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

let execNative = function (success, error, className, funName, args) {
  let exec = cordova.require('cordova/exec')
  exec(function (data) {
    success(data)
  }, function (data) {
    Vue.prototype.$toast({
      message: data.head.errmsg,
      position: 'bottom'
    })
    error(data)
  }, className, funName, args)
}

export default {
  MD5: CryptoJS.MD5,
  Utf8: CryptoJS.Utf8,
  type,
  isString,
  isObject,
  isArray,
  isWindow,
  isWechat,
  isIphone,
  isIPad,
  isIos,
  isAndroid,
  execNative,
  isFunction,
  getQueryString,
  isPlainObject,
  base64: CryptoJS.base64,
  encrypt: CryptoJS.encrypt,
  decrypt: CryptoJS.decrypt
}

export const MD5 = CryptoJS.MD5
export const encrypt = CryptoJS.encrypt
export const decrypt = CryptoJS.decrypt

export const rem2px = function (r) {
  let rem = window.docElrem
  let val = parseFloat(r) * rem
  if (typeof r === 'string' && r.match(/rem$/)) {
    val += 'px'
  }
  return val
}
export const px2rem = function (p) {
  let rem = window.docElrem
  let val = parseFloat(p) / rem
  if (typeof p === 'string' && p.match(/px$/)) {
    val += 'rem'
  }
  return val
}
export const px2px = function (p) {
  let val = rem2px(parseFloat(p) / parseFloat(75, 10))
  if (typeof p === 'string' && p.match(/px$/)) {
    val += 'px'
  }
  return val
}
export const merge = function (target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i];
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }

  return target;
}

export function camelcaseToHyphen(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// 判断参数是否是其中之一
export function oneOf(value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true
    }
  }
  return false
}
