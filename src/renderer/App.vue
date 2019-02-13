<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  const ipc = require('electron').ipcRenderer

  export default {
    name: 'humbug',
    methods: {
      // Handle navigation
      navigate: function (event, whereTo) {
        this.$router.push(whereTo)
      }
    },
    mounted: function () {
      // Listen to navigation events sent from the electron menu
      ipc.on('navigate', this.navigate)
    },
    beforeDestroy: function () {
      // Stop listening
      ipc.removeAllListeners('navigate')
    }
  }
</script>

<style>
  @import url('~@/assets/css/hutton-banner.css');
  /* CSS */
</style>
