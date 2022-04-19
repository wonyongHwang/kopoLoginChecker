# kopochecker (kopochecker)

login application with qr code

## Install the dependencies
```bash
npm install
```
## Firebase Setting
collection : admin
 - id : string
 - org : string
collection : checkin
 - id : string
 - name : string
 - temperature : string
 - time : string
collection : qrgen
 - date : string
 - id : string
 - status : string
collection : users
 - id : string
 - name : string

## Firebase Config (src/boot/firebase.js)
Copy Firebase Config and Paste to firebaseConfig
const firebaseConfig = {
    apiKey: ~,
    authDomain: ~,
    projectId: ~,
    storageBucket: ~,
    messagingSenderId: ~,
    appId: ~,
    measurementId: ~
  };

## download
download compiled css file at <project root folder>/node_modules/vue-round-slider/src/
```bash
curl -O https://cdn.jsdelivr.net/npm/round-slider@1.6.1/dist/roundslider.min.css
```
  
modify css source of round-slider.vue at <project root folder>/node_modules/vue-round-slider/src/
  
before :
```bash
  <style src='../node_modules/round-slider/dist/roundslider.min.css'></style>
```
after :
```bash  
  <style src='./roundslider.min.css'></style>
```


### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).
