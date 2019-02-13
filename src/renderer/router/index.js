import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/components/About').default
    },
    {
      path: '/image-renaming',
      name: 'image-renaming',
      component: require('@/components/ImageRenamer').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
