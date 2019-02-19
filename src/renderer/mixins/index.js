var fs = require('fs')
const sharp = require('sharp')
var path = require('path')
var axios = require('axios')

export default {
  methods: {
    checkRelease: function () {
      return axios.get('https://api.github.com/repos/sebastian-raubach/humbug-electron/releases/latest')
    },
    cloneObject: function (input) {
      return JSON.parse(JSON.stringify(input))
    },
    getByteArray: function (base64) {
      var result = base64.replace('data:image/png;base64,', '')
      result = result.replace('data:image/jpeg;base64,', '')

      return result
    },
    async getSmallBase64 (file) {
      var ext = path.extname(file).toLowerCase()
      var base64 = await sharp(file)
        .resize({ width: 512 })
        .toBuffer()

      base64 = base64.toString('base64')

      if (ext === '.png') {
        return 'data:image/png;base64,' + base64
      } else if (ext === '.jpg' || ext === '.jpeg') {
        return 'data:image/jpeg;base64,' + base64
      }
    },
    getBase64: function (file) {
      var ext = path.extname(file).toLowerCase()
      var base64 = fs.readFileSync(file, 'base64')

      if (ext === '.png') {
        return 'data:image/png;base64,' + base64
      } else if (ext === '.jpg' || ext === '.jpeg') {
        return 'data:image/jpeg;base64,' + base64
      }
    },
    arrayMove: function (arr, oldIndex, newIndex) {
      if (newIndex >= arr.length) {
        var k = newIndex - arr.length + 1
        while (k--) {
          arr.push(undefined)
        }
      }
      arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
      return arr
    }
  }
}
