const { ipcRenderer } = require("electron");

let form = document.getElementById('form');
let email = document.getElementById('email');
let licence = document.getElementById('licence');
let quitApp = document.getElementById('quit-app');
let submit = document.getElementById('submit');
let valid = false;

quitApp.addEventListener('click', quit);
form.addEventListener('submit', handleForm);

function quit() {
    ipcRenderer.send('quit');
}

async function handleForm(e) {
    e.preventDefault();
    email.disabled = true;
    licence.disabled = true;
    submit.disabled = true;
    await gumroad();
    await outOwnApi();
    if (!valid) {
        alert("Licence could not be verified!");
        email.disabled = false;
        licence.disabled = false;
        submit.disabled = false;
    }
}

async function outOwnApi() {
    if (valid) return

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "email": email.value, "phrase": licence.value });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    await fetch("https://silentshot.achuth.dev/api/verify", requestOptions)
        .then(response => response.text())
        .then(result => {
            result = JSON.parse(result);
            if (result.status === 200) {
                valid = true;
                ipcRenderer.send('verified', result);
            }
            if (result.message) alert(result.message);
        })
        .catch(error => console.log('error', error));
}

async function gumroad() {
    ipcRenderer.send('verified', { id: 'ramdon', name: 'yolo' });
    return;
    await fetch("https://api.gumroad.com/v2/licenses/verify", {
        body: `product_permalink=silentshot_app&license_key=${licence.value}&email=${email.value}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    })
    .then(result => {
        /*
        {
            "success": true,
            "uses": 3,
            "purchase": {
            "id": "OmyG5dPleDsByKGHsneuDQ==",
            "product_name": "licenses demo product",
            "created_at": "2014-04-05T00:21:56Z",
            "full_name": "Maxwell Elliott",
            "variants": "",
            "refunded": false,
            # purchase was refunded, non-subscription product only
            "chargebacked": false,
            # purchase was refunded, non-subscription product only
            "subscription_cancelled_at": null,
            # subscription was cancelled,
            subscription product only
            "subscription_failed_at": null,
            # we were unable to charge the subscriber's card
            "custom_fields": [],
            "email": "maxwell@gumroad.com"
            }
        }
        
        */
        if (result.status === 404) {
            console.log("could not verify licence please check your connection")
        }
        else if (result.status === 200) {
            return result.json();
        }
    }).then(data => {
        if (data.purchase.email === email.value) {
            valid = true;
            ipcRenderer.send('verified', { id: data.purchase.id, name: data.purchase.name });
        }
        return;
    })
    .catch(e => {
        console.log('error')
    })
}
