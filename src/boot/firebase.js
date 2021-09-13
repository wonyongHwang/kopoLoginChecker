// import { boot } from 'quasar/wrappers'
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics'
import 'firebase/firestore'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
// export default boot(async (/* { app, router, ... } */) => {
  // something to do
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "your apiKey",
    authDomain: "kopologinchecker.firebaseapp.com",
    projectId: "kopologinchecker",
    storageBucket: "kopologinchecker.appspot.com",
    messagingSenderId: "your messagingSenderId",
    appId: "your appId",
    measurementId: "your measurementId"
  };
  // Initialize Firebase
  if (!firebase.apps.length) {
   firebase.initializeApp(firebaseConfig);
  }
  firebase.analytics();

  export const auth = firebase.auth(); // https://stackoverflow.com/questions/68381469/how-to-mount-quasar-app-to-dom-after-firebase-connection-is-initialized
  export const db = firebase.firestore();
  export const g_auth = firebase.auth;
// })
