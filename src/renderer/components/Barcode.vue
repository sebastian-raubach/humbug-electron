<template>
  <b-card :class="'h-100 ' + hasImage() + ' ' + hidePrint()" no-body v-if="barcode">
    <img :src="barcode.image ? barcode.image.base64 : null" class="card-img" :style="getMaxHeight()">
    <b-row>
      <b-col xs=12 class="card-actions">
        <b-button-group class="float-right flex-wrap">
          <b-btn size=sm :title="$t('buttonTitleSelectImage')" @click="onSelectImage()"><image-plus-icon :title="$t('buttonTitleSelectImage')" /></b-btn>
          <b-btn size=sm :title="$t('buttonTitleRemoveImage')" v-if="barcode.image" @click="barcode.image = null"><image-off-icon :title="$t('buttonTitleRemoveImage')"/></b-btn>
          <b-btn size=sm :title="$t('buttonTitleDeleteBarcode')" @click="$emit('delete')" variant="danger"><delete-icon :title="$t('buttonTitleDeleteBarcode')"/></b-btn>
        </b-button-group>
        <b-button-group class="float-right flex-wrap">
          <b-btn size=sm :title="$t('buttonTitleMoveUp')" @click="$emit('moveUp')" :disabled="index.position == 0"><arrow-top-left-icon :title="$t('buttonTitleMoveUp')"/></b-btn>
          <b-btn size=sm :title="$t('buttonTitleMoveDown')" @click="$emit('moveDown')" :disabled="index.position == index.total - 1"><arrow-bottom-right-icon :title="$t('buttonTitleMoveDown')"/></b-btn>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row class="card-body">
      <b-col xs=12 class="d-flex flex-column">
        <div class="mt-auto barcode-holder">
          <div v-if="barcode.show && barcode.text" :title="$t('titleClickToChangeBarcode')">
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
          </div>
          <b-form v-else @submit.prevent class="barcode-form" >
            <b-form-input v-model="barcode.text" ref="barcodeText" @focus="barcode.show = false" @blur="onFocusLost($event)" v-on:keyup.enter="onFocusLost($event)" v-b-tooltip.focus :title="$t('tooltipBarcodeEnter')"/>
            <b-form-select class="no-print" :options="barcodeTypes" v-model="barcode.type" @change="forceFocus()"/>
          </b-form>
        </div>
      </b-col>
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
import BarcodeScanIcon from 'vue-material-design-icons/BarcodeScan.vue'

const app = require('electron').remote
const path = require('path')
const dialog = app.dialog

export default {
  name: 'barcode',
  data: function () {
    return {
      barcodeTypes: [
        'CODE128', 'CODE39', 'QR'
      ]
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
    ArrowBottomRightIcon,
    BarcodeScanIcon
  },
  methods: {
    getMaxHeight: function () {
      return this.maxHeight ? ('max-height: ' + this.maxHeight + 'px') : ''
    },
    hasImage: function () {
      return this.barcode.image ? 'has-image' : ''
    },
    hidePrint: function () {
      return (this.barcode.text === undefined || this.barcode.text.length < 1) ? 'no-print' : ''
    },
    onFocusLost: function (event) {
      if (!event.relatedTarget || event.relatedTarget.parentNode !== event.target.parentNode) {
        this.barcode.show = true
      }
    },
    forceFocus: function () {
      var ref = this.$refs.barcodeText
      ref.focus()
      if (ref.value) {
        ref.setSelectionRange(0, ref.value.length)
      }
    },
    onBarcodeClicked: function () {
      this.barcode.show = false

      var vm = this
      this.$nextTick(function () {
        vm.forceFocus()
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
      }, async function (file) {
        if (file) {
          vm.$store.dispatch('setImagePath', path.dirname(file[0]))

          vm.barcode.image = {
            base64: await vm.getSmallBase64(file[0]),
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
  .barcode-holder > :not(input):not(span) {
    cursor: pointer;
  }
  .qr-label {
    display: block;
  }
  .barcode-form *:first-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .barcode-form *:last-child {
    border-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  @media print {
    .card-actions,
    .no-print {
      display: none !important;
    }
    .has-image .card-img {
      border-bottom-right-radius: inherit;
    }
  }
</style>
