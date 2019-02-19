const state = {
  defaultBarcodeType: 'CODE128',
  onMissingBarcode: 'Skip image',
  locale: 'en_GB',
  versionToIgnore: null
}

const getters = {
  defaultBarcodeType: state => state.defaultBarcodeType,
  onMissingBarcode: state => state.onMissingBarcode,
  locale: state => state.locale,
  versionToIgnore: state => state.versionToIgnore
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
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
