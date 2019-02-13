const state = {
  defaultBarcodeType: 'CODE128',
  onMissingBarcode: 'Skip image'
}

const getters = {
  defaultBarcodeType: state => state.defaultBarcodeType,
  onMissingBarcode: state => state.onMissingBarcode
}

const mutations = {
  SET_DEFAULT_BARCODE_TYPE (state, newDefaultBarcodeType) {
    state.defaultBarcodeType = newDefaultBarcodeType
  },
  SET_ON_MISSING_BARCODE (state, newOnMissingBarcode) {
    state.onMissingBarcode = newOnMissingBarcode
  }
}

const actions = {
  setDefaultBarcodeType ({ commit }, defaultBarcodeType) {
    commit('SET_DEFAULT_BARCODE_TYPE', defaultBarcodeType)
  },
  setOnMissingBarcode ({ commit }, onMissingBarcode) {
    commit('SET_ON_MISSING_BARCODE', onMissingBarcode)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
