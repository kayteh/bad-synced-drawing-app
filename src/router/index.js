import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Canvas from '@/components/Canvas'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/canvas',
      name: 'Canvas',
      component: Canvas
    }
  ]
})
