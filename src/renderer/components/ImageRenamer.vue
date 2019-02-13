<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="primary" class="navbar-margin">
      <b-navbar-brand href="#" @click="back"><back-icon :size="48" /> <img id="logo" src="~@/assets/logo-no-bg.svg" width="30" height="30" class="d-inline-block align-top"> Image renamer</b-navbar-brand>
    </b-navbar>
    <b-container>
      <p>Please select the folder containing the images to rename, as well as the folder where you want the renamed images to be stored.</p>

      <b-form>
        <b-row>
          <b-col sm=4>
            <b-form-group label="Source folder" label-for="sourcePath">
              <b-input-group>
                <b-form-input id="sourcePath" type=text :value="sourcePath" @change.native="updateSourcePath"></b-form-input>
                <b-input-group-append>
                  <b-btn variant="secondary" @click="selectSource()">...</b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-col>
          <b-col sm=4>
            <b-form-group label="Target folder" label-for="targetPath">
              <b-input-group>
                <b-form-input id="targetPath" type=text :value="targetPath" @change.native="updateTargetPath"></b-form-input>
                <b-input-group-append>
                  <b-btn variant="secondary" @click="selectTarget()">...</b-btn>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-col>
          <b-col sm=4>
            <b-form-group label="On missing barcode" label-for="onMissing">
              <b-form-select id="onMissing" :options="onMissingOptions" :value="onMissingBarcode" @change.native="updateOnMissingBarcode"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
      </b-form>
      <b-btn @click="start()" variant="primary">Start</b-btn>
      <!-- Show the progress -->
      <b-progress :value="index" :max="images.length" show-progress :animated="index < images.length" :variant="index < images.length ? 'info' : 'success'" class="img-progress" v-if="images && images.length > 0"/>

      <!-- This image is used to render the base64 image and get the barcode. It's hidden because we don't need to show it -->
      <img ref="img" :src="currentImage" class="img-responsive w-100" @load="onImageLoad()" style="display: none;"/>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BackIcon from 'vue-material-design-icons/ArrowLeft.vue'
const { BrowserBarcodeReader, BrowserQRCodeReader } = require('@zxing/library/esm5')

const fs = require('fs')
const path = require('path')
const app = require('electron').remote
const dialog = app.dialog

export default {
  data: function () {
    return {
      onMissingOptions: ['Skip image', 'Copy original'],
      images: [],
      index: 0,
      currentImage: null,
      currentImagePath: null
    }
  },
  components: {
    BackIcon
  },
  computed: {
    ...mapGetters([
      'sourcePath',
      'targetPath',
      'onMissingBarcode'
    ])
  },
  methods: {
    // Navigate back to the landing page
    back: function () {
      this.$router.push('landing-page')
    },
    // Get the current image and set the base64 value to the <img>
    handleImage: function () {
      this.currentImagePath = path.join(this.sourcePath, this.images[this.index++])

      var base64 = this.getBase64(this.currentImagePath)
      this.currentImage = base64
    },
    updateSourcePath: function (e) {
      this.$store.dispatch('setSourcePath', e.target.value)
    },
    updateTargetPath: function (e) {
      this.$store.dispatch('setTargetPath', e.target.value)
    },
    updateOnMissingBarcode: function (e) {
      this.$store.dispatch('setOnMissingBarcode', e.target.value)
    },
    // Open dialog to choose the source folder
    selectSource () {
      var vm = this
      dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: this.sourcePath
      }, function (file) {
        if (file) {
          vm.$store.dispatch('setSourcePath', file[0])
        }
      })
    },
    // Open dialog to choose the target folder
    selectTarget () {
      var vm = this
      dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: this.targetPath ? this.targetPath : this.sourcePath
      }, function (file) {
        if (file) {
          vm.$store.dispatch('setTargetPath', file[0])
        }
      })
    },
    // When the image is loaded, try and get the barcode
    onImageLoad: function () {
      var vm = this
      this.getOneD()
        .then(result => vm.handleBarcode(result))
        .catch(err => {
          console.error(err)
          vm.getQr()
            .then(result => vm.handleBarcode(result))
            .catch(err => {
              console.error(err)
              vm.handleMissing()
            })
        })
    },
    // Try and read 1d barcodes
    getOneD: function () {
      return new BrowserBarcodeReader('video').decodeFromImage(this.$refs.img)
    },
    // Try and read 2d barcodes
    getQr: function () {
      return new BrowserQRCodeReader().decodeFromImage(this.$refs.img)
    },
    // Handle the case where no barcode is found
    handleMissing: function () {
      if (this.handleMissing === 'Copy original') {
        var fileName = path.basename(this.currentImagePath)

        var targetFile = path.join(this.targetPath, fileName)

        fs.copyFileSync(this.currentImagePath, targetFile)
      }
    },
    // Handle the case where a barcode is found
    handleBarcode: function (barcode) {
      // Copy image
      var ext = path.extname(this.currentImagePath)
      var targetFile = path.join(this.targetPath, barcode.text + ext)

      var counter = 1
      while (fs.existsSync(targetFile)) {
        targetFile = path.join(this.targetPath, barcode.text + ('-' + counter++) + ext)
      }

      fs.copyFileSync(this.currentImagePath, targetFile)

      // Progress to the next image
      if (this.index < this.images.length) {
        this.handleImage()
      } else {
        this.currentImage = null
      }
    },
    // Start the process
    start: function () {
      var vm = this
      // Read source folder and get all images
      fs.readdir(this.sourcePath, function (error, list) {
        if (error) {
          console.error(error)
        }

        vm.images = list.filter(function (file) {
          const ext = path.extname(file).toLowerCase()
          return ext === '.jpg' || ext === '.jpeg' || ext === '.png'
        })

        // Start processing
        vm.index = 0
        vm.handleImage()
      })
    }
  }
}
</script>

<style>
  .img-progress {
    margin-top: 15px;
  }
  .navbar-margin {
    margin-bottom: 15px;
  }
</style>
