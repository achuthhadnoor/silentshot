'use strict'

import { app, BrowserWindow, clipboard, Menu, Tray } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import screenshot from 'screenshot-desktop'
import {homedir} from 'os'  
const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let _tray;
let format = 'jpg'; 
function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true}})

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

function createTray(){
  const appIcon = path.join(__dirname,"../static/light.png");
  _tray = new Tray(appIcon);
  _tray.setToolTip('SilentShot | click to capture');
  _tray.on('click',()=>{
    let filename = `${homedir}/Downloads/capture${Date.now()}.${format}`;
    screenshot({filename}).then(img=>{
      console.log('copied to clipboard');
      clipboard.writeImage(img);
    });
  })
  _tray.on('right-click',()=>{
    // create context menu 
    const contextMenu = [{
      label: "copy image to clipboard / save to disk only ",
      accelerator: process.platform === 'darwin' ? 'Alt+Cmd+L' : 'Alt+Ctrl+L',
      click: () => {
        clickTray();
        tray.setTitle('')
      }
    }, {
      label: 'Stop recording',
      click: async () => {
        await stopRecording();
        return;
      }
    },
    {
      role: 'quit',
      accelerator: process.platform === 'darwin' ? 'Alt+Shift+L' : 'Alt+Shift+L',
    }]
    const TrayMenu = Menu.buildFromTemplate(contextMenu);
    _tray.popUpContextMenu(TrayMenu);
  })
}

if(app.dock){app.dock.hide()}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  // mainWindow = createMainWindow()
  createTray();
})
