<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="primary" class="navbar-margin">
      <b-navbar-brand><img id="logo" src="~@/assets/logo-no-bg.svg" width="30" height="30" class="d-inline-block align-top"> Humbug</b-navbar-brand>
    </b-navbar>
    <b-container>
      <b-form class="row settings">
        <b-col sm=4>
          <b-form-group :label="$t('labelNumberOfColumns')" label-for="columns">
            <b-form-input id="columns"
                          type="number"
                          v-model="settings.nrOfColumns"
                          required
                          min=1
                          max=4
                          :placeholder="$t('labelNumberOfColumns')">
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col sm=4>
          <b-form-group :label="$t('labelMaxImageHeight')" label-for="height">
            <b-form-input id="height"
                          type="number"
                          v-model="settings.maxHeight"
                          required
                          min=100
                          max=600
                          :placeholder="$t('labelMaxImageHeight')">
            </b-form-input>
          </b-form-group>
        </b-col>
        <b-col sm=4>
          <b-form-group :label="$t('labelDefaultBarcodeType')" label-for="barcodeType">
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
      <template v-if="barcodes">
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
      </template>
      
      <div class="mb-4">
        <b-btn class="no-print" variant="primary" @click="addBarcode()"><barcode-icon /> {{ $t("buttonAddBarcode") }}</b-btn>
        <b-btn class="no-print" variant="danger" v-b-modal.clear :disabled="!barcodes || barcodes.length === 0"><delete-icon /> {{ $t("buttonClear") }}</b-btn>
        <b-btn class="no-print" variant="success" :disabled="!barcodes || barcodes.length === 0" @click="print"><file-pdf-icon /> {{ $t("buttonExportPdf") }}</b-btn>
      </div>

      <b-modal ref="clipboardPreview" :title="$t('dialogImportClipboardTitle')" @ok="onProcessClipboard()">
        <p>{{ $t("dialogImportClipboardMessage") }}</p>
        <textarea v-model="clipboardContent" style="width: 100%; min-height: 30vh;"></textarea>
      </b-modal>

      <b-modal id="clear" :title="$t('dialogClearBarcodesTitle')" :ok-title="$t('genericYes')" :cancel-title="$t('genericNo')" ok-variant="danger" @ok="onClearPressed()">
        <p>{{ $t('dialogClearBarcodesMessage') }}</p>
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
  const readline = require('readline')
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
          maxHeight: '300'
        },
        barcodes: []
      }
    },
    computed: {
      ...mapGetters([
        'defaultBarcodeType',
        'pdfPath',
        'stateBarcodes',
        'nrOfColumns',
        'maxImageHeight'
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

        this.barcodes.forEach(function (b) {
          b.show = true
        })

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

            var result = {
              settings: vm.settings,
              barcodes: clone
            }

            fs.writeFileSync(file, JSON.stringify(result), 'utf-8')
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
        }, async function (file) {
          if (file && file.length > 0) {
            var json = JSON.parse(fs.readFileSync(file[0], 'utf-8'))

            try {
              await vm.onJsonLoaded(json)
            } catch (err) {
              dialog.showMessageBox(app.getCurrentWindow(), {
                type: 'error',
                title: vm.$t('dialogErrorTitle'),
                message: vm.$t('dialogJsonImportErrorMessage')
              })
            }
          }
        })
      },
      importDataTxt: function () {
        var vm = this

        dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{
            name: 'Text',
            extensions: ['txt']
          }]
        }, async function (file) {
          if (file && file.length > 0) {
            var lineReader = readline.createInterface({
              input: fs.createReadStream(file[0])
            })

            lineReader.on('line', function (line) {
              if (line.trim().length > 0) {
                vm.addBarcode(line)
              }
            })
          }
        })
      },
      async onJsonLoaded (json) {
        for (var i = 0; i < json.barcodes.length; i++) {
          if (json.barcodes[i].image && json.barcodes[i].image.path) {
            try {
              json.barcodes[i].image.base64 = await this.getSmallBase64(json.barcodes[i].image.path)
            } catch (err) {
              // Image wasn't found
              json.barcodes[i].image = null
            }
          }
        }

        this.settings = json.settings
        this.barcodes = json.barcodes
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
      ipc.on('importDataTxt', this.importDataTxt)

      // Load setting variables from the store
      if (this.stateBarcodes && this.stateBarcodes.length > 0) {
        this.barcodes = JSON.parse(JSON.stringify(this.stateBarcodes))
      }
      if (this.nrOfColumns) {
        this.settings.nrOfColumns = this.nrOfColumns
      }
      if (this.maxImageHeight) {
        this.settings.maxHeight = this.maxImageHeight
      }
    },
    beforeDestroy: function () {
      ipc.removeAllListeners('onPrint')
      ipc.removeAllListeners('exportData')
      ipc.removeAllListeners('importDataClipboard')
      ipc.removeAllListeners('importDataJson')
      ipc.removeAllListeners('importDataTxt')

      // Save changes to setting variables to the store
      this.$store.dispatch('setBarcodes', this.barcodes)
      this.$store.dispatch('setNrOfColumns', this.settings.nrOfColumns)
      this.$store.dispatch('setMaxImageHeight', this.settings.maxHeight)
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
