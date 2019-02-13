'use strict'

import { app, BrowserWindow, Menu } from 'electron'

// Printing to PDF
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const ipc = electron.ipcMain
const shell = electron.shell

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
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
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

  var menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Import',
          submenu: [{
            label: 'From clipboard',
            click () {
              mainWindow.webContents.send('importDataClipboard')
            }
          }, {
            label: 'From .json file',
            click () {
              mainWindow.webContents.send('importDataJson')
            }
          }]
        },
        {
          label: 'Export .json file',
          click () {
            mainWindow.webContents.send('exportData')
          }
        },
        {
          label: 'Save as PDF',
          click () {
            mainWindow.webContents.send('onPrint')
          }
        },
        {
          label: 'Bulk image renaming',
          click () {
            mainWindow.webContents.send('navigate', 'image-renaming')
          }
        },
        {
          label: 'Exit',
          click () {
            app.quit()
          }
        }
      ]
    }, {
      label: 'Help',
      submenu: [
        {
          label: 'Online help',
          click () {
            shell.openExternal('https://github.com/sebastian-raubach/humbug/wiki')
          }
        }, {
          label: 'About',
          click () {
            mainWindow.webContents.send('navigate', 'about')
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
