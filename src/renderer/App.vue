<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  const ipc = require('electron').ipcRenderer

  export default {
    name: 'humbug',
    computed: {
      ...mapGetters([
        'locale'
      ])
    },
    methods: {
      // Handle navigation
      navigate: function (event, whereTo) {
        this.$router.push(whereTo)
      },
      onLocaleChange: function (event, newLocale) {
        this.$i18n.locale = newLocale
        this.$store.dispatch('setLocale', newLocale)
      }
    },
    mounted: function () {
      // Listen to navigation events sent from the electron menu
      ipc.on('navigate', this.navigate)
      ipc.on('locale', this.onLocaleChange)

      var vm = this
      this.$store.watch(function (state) {
        return state.Settings.locale
      }, function (newValue, oldValue) {
        ipc.send('locale', {
          locale: newValue,
          i18n: vm.$i18n.messages[newValue]
        })
      })

      this.$i18n.locale = this.locale
      ipc.send('locale', {
        locale: this.locale,
        i18n: this.$i18n.messages[this.locale]
      })
    },
    beforeDestroy: function () {
      // Stop listening
      ipc.removeAllListeners('navigate')
      ipc.removeAllListeners('locale')
    }
  }
</script>

<style>
  @import url('~@/assets/css/hutton-banner.css');
  /* CSS */
</style>
