import progressbar from './progressbar'

let loadingBarInstance
let color = 'primary'
let failedColor = 'error'
let height = 2
let timer

function getLoadingBarInstance () {
  loadingBarInstance = loadingBarInstance || progressbar.newInstance({
    color: color,
    failedColor: failedColor,
    height: height,
    percent: 0,
    show: false
  })

  return loadingBarInstance
}

function update (options) {
  let instance = getLoadingBarInstance()

  instance.update(options)
}

function hide () {
  setTimeout(() => {
    update({
      show: false
    })
    setTimeout(() => {
      update({
        percent: 0
      })
    }, 200)
  }, 800)
}

function clearTimer () {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export default {
  start () {
    if (timer) return

    let percent = 0

    update({
      percent: percent,
      status: 'success',
      show: true
    })

    timer = setInterval(() => {
      percent += Math.floor(Math.random() * 3 + 5)
      if (percent > 95) {
        clearTimer()
      }
      update({
        percent: percent,
        status: 'success',
        show: true
      })
    }, 200)
  },
  update (percent) {
    clearTimer()
    update({
      percent: percent,
      status: 'success',
      show: true
    })
  },
  finish () {
    clearTimer()
    update({
      percent: 100,
      status: 'success',
      show: true
    })
    hide()
  },
  error () {
    clearTimer()
    update({
      percent: 100,
      status: 'error',
      show: true
    })
    hide()
  },
  config (options) {
    if (options.color) {
      color = options.color
    }
    if (options.failedColor) {
      failedColor = options.failedColor
    }
    if (options.height) {
      height = options.height
    }
  },
  destroy () {
    clearTimer()
    let instance = getLoadingBarInstance()
    loadingBarInstance = null
    instance.destroy()
  }
}
