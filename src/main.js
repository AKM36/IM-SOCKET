// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import components from 'components'
import VueRouter from 'vue-router'
import api from '@/api'
import 'assets/styles'
import 'assets/font/iconfont.css'
import messageBox from 'components/message-box'
import App from './Main.vue'

import progressbar from 'plugins/progressbar'
window.localStorage.debug = 'false'
Vue.config.productionTip = false

Vue.use(api)
// Vue.use(components)
Vue.prototype.$messageBox = messageBox
Vue.prototype.$Progress = progressbar


/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})


