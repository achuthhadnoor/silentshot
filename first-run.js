async function onFirstRunMaybe(){isFirstRun()&&await promptMoveToApplicationsFolder()}async function promptMoveToApplicationsFolder(){if("darwin"!==process.platform)return;const t=!!process.defaultApp;if(t||app.isInApplicationsFolder())return;const{response:o}=await dialog.showMessageBox({type:"question",buttons:["Move to Applications Folder","Do Not Move"],defaultId:0,message:"Move to Applications Folder?"});0===o&&app.moveToApplicationsFolder()}function isFirstRun(){const t=getConfigPath();try{if(fs.existsSync(t))return!1;fs.outputFileSync(t,"")}catch(t){console.warn("First run: Unable to write firstRun file",t)}return!0}const{app:app,dialog:dialog}=require("electron"),fs=require("fs-extra"),path=require("path"),getConfigPath=()=>{const t=app.getPath("userData");return path.join(t,"FirstRun","uiuxdx-silentshot-first-run")};module.exports={onFirstRunMaybe:onFirstRunMaybe};