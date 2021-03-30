'use strict'

const { app, Tray, clipboard, Menu, dialog, shell, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const screenshot = require('screenshot-desktop')
const { homedir } = require('os');
const { onFirstRunMaybe } = require("./first-run");
const Store = require("electron-store");
const AutoLaunch = require("auto-launch");

const autoLauncher = new AutoLaunch({
  name: "Lapse",
  path: '/Applications/lapse.app',
});

let store = new Store();
let _tray;
let browserWindow;
let user={
  isVerified:false
};
let settings = {
  format: 'png',
  defaultDir: homedir,
  savetoClipboard: true,
  saveToDevice: true, 
} 

if (store.get('user-info')) {
  user = store.get('user-info');
}
if (store.get('silentshot')) {
  settings = store.get('silentshot'); 
}
else {
  store.set('silentshot', settings);
}

let saveToFolder = true;
let copyToClipBoard = true;
if (app.dock) app.dock.hide();

function createTray() {
  const appIcon = join(__dirname, "static/light.png");
  _tray = new Tray(appIcon);
  _tray.setToolTip('SilentShot | click to capture');
  _tray.on('click', () => {
    let filename = `${settings.defaultDir}/Downloads/capture${Date.now()}.${settings.format}`;
    if (settings.saveToFolder) {
      screenshot({ filename }).then(img => {
        console.log('Copied to clipboard and saved to device!');
        if (settings.copyToClipBoard) {
          clipboard.writeImage(img);
        };
      });
    }
    else {
      screenshot().then(img => {
        console.log('Copied to clipboard');
        clipboard.writeImage(img);
      });
    }
  })
  _tray.on('right-click', () => {
    // create context menu
    const contextMenu = [{
      label: "save options",
      submenu: [{
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+L' : 'Alt+Ctrl+L',
        label: 'Save to folder',
        type: "checkbox",
        click: () => {
          saveToFolder = saveToFolder ? false : true;
          if (!copyToClipBoard) copyToClipBoard = true;
        },
        checked: saveToFolder,
      }, {
        label: 'Copy to clipboard',
        type: "checkbox",
        click: () => {
          copyToClipBoard = copyToClipBoard ? false : true;
          console.log(copyToClipBoard);
        },
        checked: copyToClipBoard,
      }],
    }, {
      label: "change default directory",
      click: () => {
        dialog.showOpenDialog({
          properties: ['openDirectory']
        }).then(filepath => {
          settings.defaultDir = filepath.filePaths[0];
        })
      }
    },
    {
      label: "About Silentshot",
      click: () => { shell.openExternal('https://silentshot.achuth.dev') }
    },
    {
      role: 'quit',
      accelerator: process.platform === 'darwin' ? 'Alt+Shift+L' : 'Alt+Shift+L',
    }]
    const TrayMenu = Menu.buildFromTemplate(contextMenu);
    _tray.popUpContextMenu(TrayMenu);
  })
}

function createBrowserWindow (){
  browserWindow = new BrowserWindow({
    icon: join('./static/icon.png'),
    frame: false,
    height: 300,
    width: 300,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent:true,
    maximizable:false,
    minimizable:false,
    hasShadow:false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  browserWindow.loadFile('./static/index.html')
}

app.on('ready', async() => {
  await onFirstRunMaybe();
  if(user.isVerified){
    return;
  }
  if (user.isVerified) {
    if (settings.autolaunch) {
      autoLauncher.enable();
    }
    else {
      autoLauncher.disable();
    }
    createTray();
    createGlobalshortcuts();
    return;
  }
  createBrowserWindow();
})


ipcMain.on('verified', (event, { id, name }) => {
  event.returnValue = "Verified";
  user.id = id;
  user.name = name;
  user.isVerified = true;
  store.set('user-info', user);
  browserWindow.hide(); 
  createTray();
})


ipcMain.on('quit', () => {
  app.quit()
})