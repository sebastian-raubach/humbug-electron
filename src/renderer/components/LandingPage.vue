<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="primary" class="navbar-margin">
      <b-navbar-brand><img id="logo" src="~@/assets/logo-no-bg.svg" width="30" height="30" class="d-inline-block align-top"> Humbug</b-navbar-brand>
    </b-navbar>
    <b-container>
      <b-form class="row settings">
        <b-col sm=4>
          <b-form-group label="Number of columns:" label-for="columns">
            <b-form-input id="columns"
                          type="number"
                          v-model="settings.nrOfColumns"
                          required
                          min=1
                          max=4
                          placeholder="Number of columns">
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col sm=4>
          <b-form-group label="Max. image height:" label-for="height">
            <b-form-input id="height"
                          type="number"
                          v-model="settings.maxHeight"
                          required
                          min=100
                          max=600
                          placeholder="Max. image height">
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col sm=4>
          <b-form-group label="Default barcode type:" label-for="barcodeType">
            <b-form-select id="barcodeType"
                        :options="barcodeTypes"
                        required
                        v-model="selectedBarcodeType"
                        @change="onDefaultBarcodeTypeChanged()">
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-form>
      <!-- Make sure only #nrOfColumns items per row (for printing) -->
      <b-row v-for="i in Math.ceil(barcodes.length / (+settings.nrOfColumns))" :key="i" class="print-row">
        <b-col v-for="(barcode, index) in getBarcodeChunk(i - 1)" :key="index" :cols="12 / settings.nrOfColumns" class="mb-4">
          <Barcode :maxHeight="settings.maxHeight"
                  :barcode="barcode"
                  :index="{ position: ((i - 1) * settings.nrOfColumns) + index, total: barcodes.length }"
                  :ref="'barcode-' + (((i - 1) * settings.nrOfColumns) + index)"
                  v-on:delete="() => deleteBarcode(((i - 1) * settings.nrOfColumns) + index)"
                  v-on:moveUp="() => moveUp(((i - 1) * settings.nrOfColumns) + index)"
                  v-on:moveDown="() => moveDown(((i - 1) * settings.nrOfColumns) + index)" />
        </b-col>
      </b-row>
      
      <b-btn class="no-print" variant="primary" @click="addBarcode()"><barcode-icon /> Add barcode</b-btn>
      <b-btn class="no-print" variant="danger" v-b-modal.clear :disabled="!barcodes || barcodes.length === 0"><delete-icon /> Clear</b-btn>
      <b-btn class="no-print" variant="success" :disabled="!barcodes || barcodes.length === 0" @click="print"><file-pdf-icon /> Export PDF</b-btn>

      <b-modal ref="clipboardPreview" title="Clipboard preview" @ok="onProcessClipboard()">
        <p>Each line will be imported as a separate barcode. Click OK to import the clipboard.</p>
        <textarea v-model="clipboardContent" style="width: 100%; min-height: 30vh;"></textarea>
      </b-modal>

      <b-modal id="clear" title="Clear barcodes" ok-title="Yes" cancel-title="No" ok-variant="danger" @ok="onClearPressed()">
        <p>Are you sure you want to delete all barcodes?</p>
      </b-modal>
    </b-container>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import BarcodeIcon from 'vue-material-design-icons/Barcode.vue'
  import DeleteIcon from 'vue-material-design-icons/Delete.vue'
  import FilePdfIcon from 'vue-material-design-icons/FilePdf.vue'
  import Barcode from './Barcode'
  const clipboard = require('electron').clipboard
  const app = require('electron').remote
  const dialog = app.dialog
  const fs = require('fs')
  const path = require('path')
  const ipc = require('electron').ipcRenderer

  export default {
    name: 'landing-page',
    data: function () {
      return {
        barcodeTypes: [
          'CODE128', 'CODE39', 'QR'
        ],
        selectedBarcodeType: null,
        clipboardContent: null,
        settings: {
          nrOfColumns: 3,
          maxHeight: '400'
        },
        barcodes: []
      }
    },
    computed: {
      ...mapGetters([
        'defaultBarcodeType',
        'pdfPath'
      ])
    },
    components: { Barcode, BarcodeIcon, DeleteIcon, FilePdfIcon },
    methods: {
      moveUp: function (currentIndex) {
        this.barcodes = this.arrayMove(this.barcodes, currentIndex, currentIndex - 1)
      },
      moveDown: function (currentIndex) {
        this.barcodes = this.arrayMove(this.barcodes, currentIndex, currentIndex + 1)
      },
      onClearPressed: function () {
        this.barcodes = []
      },
      getBarcodeChunk: function (i) {
        var vm = this
        return this.barcodes.filter(function (barcode, index) {
          return (i * vm.settings.nrOfColumns) <= index && ((i + 1) * vm.settings.nrOfColumns) > index
        })
      },
      addBarcode: function (text) {
        this.barcodes.push({
          text: text,
          type: this.defaultBarcodeType,
          show: text !== null,
          image: null
        })

        if (!text) {
          var vm = this
          this.$nextTick(function () {
            // Focus
            vm.$refs['barcode-' + (vm.barcodes.length - 1)][0].onBarcodeClicked()
          })
        }
      },
      print: function (event) {
        var vm = this
        dialog.showSaveDialog({
          filters: [{
            name: 'PDF',
            extensions: ['pdf']
          }],
          defaultPath: this.pdfPath
        }, function (file) {
          if (file) {
            vm.$store.dispatch('setPdfPath', path.dirname(file))
            ipc.send('print-to-pdf', file)
          }
        })
      },
      getColumnStyle: function () {
        return 'col-sm-' + (12 / this.settings.nrOfColumns)
      },
      deleteBarcode: function (index) {
        this.barcodes.splice(index, 1)
      },
      exportData: function () {
        var vm = this
        dialog.showSaveDialog({
          filters: [{
            name: 'Json',
            extensions: ['json']
          }]
        }, function (file) {
          if (file) {
            var clone = vm.cloneObject(vm.barcodes)
            clone.forEach(function (b) {
              if (b.image) {
                delete b.image.base64
              }
            })
            fs.writeFileSync(file, JSON.stringify(clone), 'utf-8')
          }
        })
      },
      importDataClipboard: function () {
        this.clipboardContent = clipboard.readText()
        this.$refs.clipboardPreview.show()
      },
      importDataJson: function () {
        var vm = this

        dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{
            name: 'Json',
            extensions: ['json']
          }]
        }, function (file) {
          if (file) {
            var temp = JSON.parse(fs.readFileSync(file[0], 'utf-8'))

            temp.forEach(function (barcode) {
              if (barcode.image && barcode.image.path) {
                barcode.image.base64 = vm.getBase64(barcode.image.path)
              }
            })

            vm.barcodes = temp
          }
        })
      },
      onProcessClipboard: function () {
        var lines = this.clipboardContent.split('\n')

        var vm = this
        lines.forEach(function (line) {
          if (line.trim().length > 0) {
            vm.addBarcode(line)
          }
        })
      },
      onDefaultBarcodeTypeChanged: function () {
        var vm = this
        // TODO: Remove this hack when a new version of bootstrap-vue is released (https://github.com/bootstrap-vue/bootstrap-vue/pull/2207)
        this.$nextTick(function () {
          vm.$store.dispatch('setDefaultBarcodeType', vm.selectedBarcodeType)
        })
      }
    },
    mounted: function () {
      this.selectedBarcodeType = this.defaultBarcodeType
      ipc.on('onPrint', this.print)
      ipc.on('exportData', this.exportData)
      ipc.on('importDataClipboard', this.importDataClipboard)
      ipc.on('importDataJson', this.importDataJson)
    },
    beforeDestroy: function () {
      ipc.removeAllListeners('onPrint')
      ipc.removeAllListeners('exportData')
      ipc.removeAllListeners('importDataClipboard')
      ipc.removeAllListeners('importDataJson')
    }
  }
</script>

<style>
  .navbar-margin {
    margin-bottom: 15px;
  }
  @media print {
    .settings,
    button {
      display: none !important;
    }

    .print-row {
      page-break-inside: avoid;
    }
  }
</style>
