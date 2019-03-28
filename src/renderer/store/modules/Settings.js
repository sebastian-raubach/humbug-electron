const uuidv4 = require('uuid/v4')

const state = {
  defaultBarcodeType: 'CODE128',
  onMissingBarcode: 'Skip image',
  locale: 'en_GB',
  versionToIgnore: null,
  uuid: uuidv4(),
  stateBarcodes: [],
  nrOfColumns: 3,
  maxImageHeight: '300'
}

const getters = {
  defaultBarcodeType: state => state.defaultBarcodeType,
  onMissingBarcode: state => state.onMissingBarcode,
  locale: state => state.locale,
  versionToIgnore: state => state.versionToIgnore,
  uuid: state => state.uuid,
  stateBarcodes: state => state.stateBarcodes,
  nrOfColumns: state => state.nrOfColumns,
  maxImageHeight: state => state.maxImageHeight
}

const mutations = {
  SET_DEFAULT_BARCODE_TYPE (state, newDefaultBarcodeType) {
    state.defaultBarcodeType = newDefaultBarcodeType
  },
  SET_ON_MISSING_BARCODE (state, newOnMissingBarcode) {
    state.onMissingBarcode = newOnMissingBarcode
  },
  SET_LOCALE (state, newLocale) {
    state.locale = newLocale
  },
  SET_VERSION_TO_IGNORE (state, newVersionToIgnore) {
    state.versionToIgnore = newVersionToIgnore
  },
  SET_UUID (state, newUuid) {
    state.uuid = newUuid
  },
  SET_BARCODES (state, newStateBarcodes) {
    state.stateBarcodes = newStateBarcodes
  },
  SET_NR_OF_COLUMNS (state, newNrOfColumns) {
    state.nrOfColumns = newNrOfColumns
  },
  SET_MAX_IMAGE_HEIGHT (state, newMaxImageHeight) {
    state.maxImageHeight = newMaxImageHeight
  }
}

const actions = {
  setDefaultBarcodeType ({ commit }, defaultBarcodeType) {
    commit('SET_DEFAULT_BARCODE_TYPE', defaultBarcodeType)
  },
  setOnMissingBarcode ({ commit }, onMissingBarcode) {
    commit('SET_ON_MISSING_BARCODE', onMissingBarcode)
  },
  setLocale ({ commit }, locale) {
    commit('SET_LOCALE', locale)
  },
  setVersionToIgnore ({ commit }, versionToIgnore) {
    commit('SET_VERSION_TO_IGNORE', versionToIgnore)
  },
  setUuid ({ commit }, uuid) {
    commit('SET_UUID', uuid)
  },
  setBarcodes ({ commit }, stateBarcodes) {
    commit('SET_BARCODES', stateBarcodes)
  },
  setNrOfColumns ({ commit }, nrOfColumns) {
    commit('SET_NR_OF_COLUMNS', nrOfColumns)
  },
  setMaxImageHeight ({ commit }, maxImageHeight) {
    commit('SET_MAX_IMAGE_HEIGHT', maxImageHeight)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
