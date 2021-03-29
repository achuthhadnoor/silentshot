'use strict'

const { app, Tray, clipboard, Menu } = require("electron");
const { join } = require("path");
const screenshot = require('screenshot-desktop')
const { homedir } = require('os');
let _tray;
let format = 'jpg';
let saveToFolder = true;
let copyToClipBoard = true;

if (app.dock) app.dock.hide();

function createTray() {
  const appIcon = join(__dirname, "static/light.png");
  _tray = new Tray(appIcon);
  _tray.setToolTip('SilentShot | click to capture');
  _tray.on('click', () => {
    let filename = `${homedir}/Downloads/capture${Date.now()}.${format}`;
    screenshot({ filename }).then(img => {
      console.log('copied to clipboard');
      clipboard.writeImage(img);
    });
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
    },
    {
      role: 'quit',
      accelerator: process.platform === 'darwin' ? 'Alt+Shift+L' : 'Alt+Shift+L',
    }]
    const TrayMenu = Menu.buildFromTemplate(contextMenu);
    _tray.popUpContextMenu(TrayMenu);
  })
}

app.on('ready', () => {
  createTray();
})