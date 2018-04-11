import progressBar from './progressbar.vue'
import Vue from 'vue'
import { camelcaseToHyphen } from 'utils'

progressBar.newInstance = properties => {
  const _props = properties || {}

  let props = ''
  Object.keys(_props).forEach(prop => {
    props += ' :' + camelcaseToHyphen(prop) + '=' + prop
  })

  const div = document.createElement('div')
  div.innerHTML = `<progress-bar${props}></progress-bar>`
  document.body.appendChild(div)

  const $progress = new Vue({
    el: div,
    data: _props,
    components: { progressBar }
  })

  return {
    update(options) {
      if ('percent' in options) {
        $progress.percent = options.percent
      }
      if (options.status) {
        $progress.status = options.status
      }
      if ('show' in options) {
        $progress.show = options.show
      }
    },
    component: $progress,
    destroy() {
      document.body.removeChild(div)
    }
  }
}

export default progressBar
