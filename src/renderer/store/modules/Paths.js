const state = {
  imagePath: null,
  pdfPath: null,
  sourcePath: null,
  targetPath: null
}

const getters = {
  imagePath: state => state.imagePath,
  pdfPath: state => state.pdfPath,
  sourcePath: state => state.sourcePath,
  targetPath: state => state.targetPath
}

const mutations = {
  SET_IMAGE_PATH (state, newImagePath) {
    state.imagePath = newImagePath
  },
  SET_PDF_PATH (state, newPdfPath) {
    state.pdfPath = newPdfPath
  },
  SET_SOURCE_PATH (state, newSourcePath) {
    state.sourcePath = newSourcePath
  },
  SET_TARGET_PATH (state, newTargetPath) {
    state.targetPath = newTargetPath
  }
}

const actions = {
  setImagePath ({ commit }, imagePath) {
    commit('SET_IMAGE_PATH', imagePath)
  },
  setPdfPath ({ commit }, pdfPath) {
    commit('SET_PDF_PATH', pdfPath)
  },
  setSourcePath ({ commit }, sourcePath) {
    commit('SET_SOURCE_PATH', sourcePath)
  },
  setTargetPath ({ commit }, targetPath) {
    commit('SET_TARGET_PATH', targetPath)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
