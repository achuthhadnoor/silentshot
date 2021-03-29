'use strict'

const { app, Tray, clipboard } = require("electron");
const { join } = require("path");
const screenshot = require('screenshot-desktop')
const {homedir} = require('os');
let _tray;
let format = 'jpg'; 

if (app.dock) app.dock.hide();

function createTray() {
    const appIcon = join(__dirname,"static/light.png");
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

app.on('ready',() => {
    createTray();
})


