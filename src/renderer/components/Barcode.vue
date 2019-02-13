<template>
  <b-card :class="'h-100 ' + hasImage()" no-body v-if="barcode">
    <img :src="barcode.image ? barcode.image.base64 : null" class="card-img" :style="getMaxHeight()">
    <b-row>
      <b-col xs=12 class="card-actions">
        <b-button-group class="float-right flex-wrap">
          <b-btn size=sm @click="onSelectImage()"><image-plus-icon /></b-btn>
          <b-btn size=sm v-if="barcode.image" @click="barcode.image = null"><image-off-icon /></b-btn>
          <b-btn size=sm @click="$emit('delete')" variant="danger"><delete-icon /></b-btn>
        </b-button-group>
        <b-button-group class="float-right flex-wrap">
          <b-btn size=sm @click="$emit('moveUp')" :disabled="index.position == 0"><arrow-top-left-icon /></b-btn>
          <b-btn size=sm @click="$emit('moveDown')" :disabled="index.position == index.total - 1"><arrow-bottom-right-icon /></b-btn>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row class="card-body d-flex flex-column">
      <div class="mt-auto barcode-holder">
        <template v-if="barcode.show && barcode.text">
          <template v-if="barcode.type === 'QR'">
            <qrcode class="barcode" :value="barcode.text" @click.native="onBarcodeClicked()"/>
            <span class="qr-label">{{ barcode.text }}</span>
          </template>
          <v-barcode
                v-else
                :value="barcode.text"
                :format="barcode.type" 
                class="barcode"
                font="Segoe UI"
                width=1 height=25 fontSize=14 background="rgba(0,0,0,0)" textMargin=0
                @click.native="onBarcodeClicked()" />
        </template>
        <input v-else v-model="barcode.text" ref="barcodeText" @focus="barcode.show = false" @blur="onFocusLost($event)" v-on:keyup.enter="onFocusLost($event)"/>
      </div>
    </b-row>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import VueBarcode from 'vue-barcode'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import ImagePlusIcon from 'vue-material-design-icons/ImagePlus.vue'
import ImageOffIcon from 'vue-material-design-icons/ImageOff.vue'
import ArrowTopLeftIcon from 'vue-material-design-icons/ArrowTopLeft.vue'
import ArrowBottomRightIcon from 'vue-material-design-icons/ArrowBottomRight.vue'

const app = require('electron').remote
const path = require('path')
const dialog = app.dialog

export default {
  name: 'barcode',
  data: function () {
    return {
    }
  },
  props: {
    barcode: {
      type: Object
    },
    index: {
      type: Object
    },
    maxHeight: {
      type: String
    }
  },
  computed: {
    ...mapGetters([
      'imagePath'
    ])
  },
  components: {
    'v-barcode': VueBarcode,
    DeleteIcon,
    ImagePlusIcon,
    ImageOffIcon,
    ArrowTopLeftIcon,
    ArrowBottomRightIcon
  },
  methods: {
    getMaxHeight: function () {
      return this.maxHeight ? ('max-height: ' + this.maxHeight + 'px') : ''
    },
    hasImage: function () {
      return this.barcode.image ? 'has-image' : ''
    },
    onFocusLost: function (event) {
      this.barcode.show = true
    },
    onBarcodeClicked: function () {
      this.barcode.show = false

      var vm = this
      this.$nextTick(function () {
        var ref = vm.$refs.barcodeText
        ref.focus()
        ref.setSelectionRange(0, ref.value.length)
      })
    },
    onSelectImage: function () {
      var vm = this

      dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png']
        }],
        defaultPath: this.imagePath
      }, function (file) {
        if (file) {
          vm.$store.dispatch('setImagePath', path.dirname(file[0]))

          vm.barcode.image = {
            base64: vm.getBase64(file[0]),
            path: file[0]
          }
        }
      })
    }
  }
}
</script>

<style>
  .card-actions .btn-group:last-child button:first-child {
    border-top-left-radius: 0;
  }
  .card-actions .btn-group:last-child button:last-child,
  .card-actions .btn-group:first-child button:last-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .card-actions .btn-group:first-child button:first-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .has-image .card-img {
    border-bottom-right-radius: 0;
    width: 100%;
    object-fit: cover;
  }
  .barcode,
  .barcode svg {
    max-width: 100%;
  }
  .barcode-holder {
    text-align: center;
  }
  .qr-label {
    display: block;
  }

  @media print {
    .card-actions {
      display: none !important;
    }
    .has-image .card-img {
      border-bottom-right-radius: inherit;
    }
  }
</style>
