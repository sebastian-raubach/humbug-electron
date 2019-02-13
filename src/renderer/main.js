import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import BootstrapVue from 'bootstrap-vue'
import '@/assets/custom.scss'
import 'vue-material-design-icons/styles.css'
import VueQrcode from '@chenfengyuan/vue-qrcode'

import mixin from './mixins'

Vue.component(VueQrcode.name, VueQrcode)

Vue.use(BootstrapVue)

Vue.mixin(mixin)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
