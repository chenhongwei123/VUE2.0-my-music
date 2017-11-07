// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import fastclick from 'fastclick'
import router from './router'
import VueLazyload from 'vue-lazyload'
import store from './store'
import 'common/stylus/index.styl'

//import vConsole from 'vconsole'       //手机端调试输出 console

Vue.config.productionTip = false

fastclick.attach(document.body)

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
