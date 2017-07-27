import Vue from 'vue'
import App from './App'
import router from './router'
import VueSocketio from 'vue-socket.io'
import io from 'socket.io-client'
import Vue2TouchEvents from 'vue2-touch-events'

Vue.use(Vue2TouchEvents)
Vue.use(VueSocketio, io('10.0.0.59:3000', {
  transports: ['websocket']
}))

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
