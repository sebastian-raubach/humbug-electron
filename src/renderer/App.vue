<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  const remote = require('electron').remote
  const app = remote.app
  const dialog = remote.dialog
  const shell = remote.shell
  const ipc = require('electron').ipcRenderer
  const compareVersions = require('compare-versions')
  const axios = require('axios')
  const os = require('os')

  export default {
    name: 'humbug',
    data: function () {
      return {
        trackingUrl: 'https://ics.hutton.ac.uk/resources/humbug/logs/humbug.pl',
        version: app.getVersion()
      }
    },
    computed: {
      ...mapGetters([
        'locale',
        'versionToIgnore',
        'uuid'
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
      },
      trackHit () {
        var osName = os.type()
        var osVersion = os.release()
        var osArch = os.arch()

        var osString = osName + ' ' + osVersion + ' (' + osArch + ')'

        axios.get(this.trackingUrl + '?id=' + encodeURIComponent(this.uuid) + '&version=' + encodeURIComponent(this.version) + '&locale=' + encodeURIComponent(this.locale) + '&os=' + encodeURIComponent(osString))
          .catch(function () {
            console.error('error tracking app usage')
          })
      },
      checkForUpdates (automaticTrigger) {
        var vm = this
        this.checkRelease()
          .then(function (response) {
            console.log('error', response.code)
            if (response && response.data) {
              if (response.data.tag_name === vm.versionToIgnore && automaticTrigger === true) {
                // User chose to ignore this version
                console.log('user chose to ignore this version')
              } else {
                console.log(response.data.tag_name, app.getVersion())

                if (response.data.assets.length < 1) {
                  // There is a new release, but no associated assets
                  console.log('no assets for release')
                  if (automaticTrigger !== true) {
                    vm.showNoUpdateDialog()
                  }
                } else {
                  try {
                    var result = compareVersions(response.data.tag_name, app.getVersion())
                    if (result === 1) {
                      vm.showUpdateDialog(response.data)
                    } else if (automaticTrigger !== true) {
                      vm.showNoUpdateDialog()
                    }
                  } catch (err) {
                    console.error('Invalid version number', response.data.tag_name, app.getVersion())
                    vm.showNoUpdateDialog()
                  }
                }
              }
            }
          })
          .catch(function (err) {
            if (err.response && err.response.status) {
              // The request failed based on a genuine error code
              console.error(err)
              if (automaticTrigger !== true) {
                vm.showNoUpdateDialog()
              }
            } else {
              // It's a network error (e.g. no network connection)
              console.log('ERROR', JSON.stringify(err))
            }
          })
      },
      showNoUpdateDialog () {
        dialog.showMessageBox(remote.getCurrentWindow(), {
          type: 'info',
          title: this.$t('dialogNoNewVersionTitle'),
          message: this.$t('dialogNoNewVersionMessage')
        })
      },
      showUpdateDialog: function (update) {
        var vm = this
        dialog.showMessageBox(remote.getCurrentWindow(), {
          type: 'question',
          buttons: [this.$t('buttonSkipVersion'), this.$t('genericYes'), this.$t('genericNo')],
          defaultId: 1,
          cancelId: 2,
          noLink: true,
          title: this.$t('dialogNewVersionTitle'),
          message: this.$t('dialogNewVersionMessage'),
          detail: this.$t('dialogNewVersionNumber', [update.tag_name, new Date(update.published_at).toLocaleString(this.locale.replace('_', '-'))])
        }, function (result) {
          switch (result) {
            case 0:
              vm.$store.dispatch('setVersionToIgnore', update.tag_name)
              break
            case 1:
              shell.openExternal(update.html_url)
              break
            case 2:
            default:
              console.log('no')
          }
        })
      }
    },
    mounted: function () {
      // Listen to navigation events sent from the electron menu
      ipc.on('navigate', this.navigate)
      ipc.on('locale', this.onLocaleChange)
      ipc.on('checkUpdates', this.checkForUpdates)

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

      if (process.env.NODE_ENV !== 'development') {
        this.checkForUpdates(true)
        this.trackHit()
      }
    },
    beforeDestroy: function () {
      // Stop listening; teardown
      ipc.removeAllListeners('navigate')
      ipc.removeAllListeners('locale')
      ipc.removeAllListeners('checkUpdates')
    }
  }
</script>

<style>
  @import url('~@/assets/css/hutton-banner.css');
  /* CSS */
</style>
