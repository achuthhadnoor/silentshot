function quit(){ipcRenderer.send("quit")}async function handleForm(e){e.preventDefault(),email.disabled=!0,licence.disabled=!0,submit.disabled=!0,await gumroad(),await outOwnApi(),valid||(alert("Licence could not be verified!"),email.disabled=!1,licence.disabled=!1,submit.disabled=!1)}async function outOwnApi(){if(!valid){var e=new Headers;e.append("Content-Type","application/json");var i=JSON.stringify({email:email.value,phrase:licence.value}),t={method:"POST",headers:e,body:i,redirect:"follow"};await fetch("https://silentshot.achuth.dev/api/verify",t).then(e=>e.text()).then(e=>{e=JSON.parse(e),200===e.status&&(valid=!0,ipcRenderer.send("verified",e)),e.message&&alert(e.message)}).catch(e=>console.log("error",e))}}async function gumroad(){await fetch("https://api.gumroad.com/v2/licenses/verify",{body:`product_permalink=silentshot_app&license_key=${licence.value}&email=${email.value}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},method:"POST"}).then(e=>{if(404===e.status)console.log("could not verify licence please check your connection");else if(200===e.status)return e.json()}).then(e=>{e.purchase.email===email.value&&(valid=!0,ipcRenderer.send("verified",{id:e.purchase.id,name:e.purchase.name}))}).catch(e=>{console.log("error")})}const{ipcRenderer:ipcRenderer}=require("electron");let form=document.getElementById("form"),email=document.getElementById("email"),licence=document.getElementById("licence"),quitApp=document.getElementById("quit-app"),submit=document.getElementById("submit"),valid=!1;quitApp.addEventListener("click",quit),form.addEventListener("submit",handleForm);
