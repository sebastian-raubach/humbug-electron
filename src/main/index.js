'use strict'

import { app, BrowserWindow, Menu } from 'electron'
// import { autoUpdater } from 'electron-updater'

// Printing to PDF
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const ipc = electron.ipcMain
const shell = electron.shell
const nativeImage = electron.nativeImage

let mainWindow
var messages = {}
var menuTemplate = createMenuTemplate(null)

ipc.on('locale', (event, result) => {
  messages = result.i18n
  menuTemplate = createMenuTemplate(result.locale)
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
})

ipc.on('print-to-pdf', (event, pdfPath) => {
  const win = BrowserWindow.fromWebContents(event.sender)

  win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    marginsType: 0
  }, (error, data) => {
    if (error) {
      return console.log(error.message)
    }

    fs.writeFile(pdfPath, data, err => {
      if (err) {
        return console.log(err.message)
      }

      shell.openExternal('file://' + pdfPath)
      event.sender.send('wrote-pdf', pdfPath)
    })
  })
})

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: 'Humbug',
    height: 563,
    useContentSize: true,
    width: 1000,
    icon: path.join(__dirname, 'assets/logo.png')
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function createMenuTemplate (locale) {
  var deImage = nativeImage.createFromPath(path.join(__static, 'de.png'))
  var gbImage = nativeImage.createFromPath(path.join(__static, 'gb.png'))

  return [
    {
      label: messages.menuFile,
      submenu: [
        {
          label: messages.menuFileImport,
          submenu: [{
            label: messages.menuFileImportClipboard,
            click () {
              mainWindow.webContents.send('importDataClipboard')
            }
          }, {
            label: messages.menuFileImportJson,
            click () {
              mainWindow.webContents.send('importDataJson')
            }
          }, {
            label: messages.menuFileImportText,
            click () {
              mainWindow.webContents.send('importDataTxt')
            }
          }]
        },
        {
          label: messages.menuFileExportJson,
          click () {
            mainWindow.webContents.send('exportData')
          }
        },
        {
          label: messages.menuFileSaveAsPdf,
          click () {
            mainWindow.webContents.send('onPrint')
          }
        },
        {
          label: messages.menuFileBulkImageRenaming,
          click () {
            mainWindow.webContents.send('navigate', 'image-renaming')
          }
        },
        {
          label: messages.menuFileExit,
          click () {
            app.quit()
          }
        }
      ]
    }, {
      label: messages.menuLanguage,
      submenu: [
        {
          label: 'British English',
          type: 'radio',
          checked: locale === 'en_GB',
          icon: gbImage.isEmpty() ? null : gbImage,
          click () {
            mainWindow.webContents.send('locale', 'en_GB')
          }
        }, {
          label: 'Deutsch - Deutschland',
          type: 'radio',
          checked: locale === 'de_DE',
          icon: deImage.isEmpty() ? null : deImage,
          click () {
            mainWindow.webContents.send('locale', 'de_DE')
          }
        }
      ]
    }, {
      label: messages.menuHelp,
      submenu: [
        {
          label: messages.menuHelpOnline,
          click () {
            shell.openExternal('https://github.com/sebastian-raubach/humbug/wiki')
          }
        }, {
          label: messages.menuHelpCheckUpdates,
          click () {
            mainWindow.webContents.send('checkUpdates')
          }
        }, {
          label: messages.menuHelpAbout,
          click () {
            mainWindow.webContents.send('navigate', 'about')
          }
        }
      ]
    }
  ]
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })

// app.on('ready', () => {
//   try {
//     if (process.env.NODE_ENV === 'production') {
//       autoUpdater.checkForUpdates()
//     } else {
//       autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml')
//       autoUpdater.checkForUpdatesAndNotify()
//     }
//   } catch (error) {
//     console.error(error)
//   }
// })
