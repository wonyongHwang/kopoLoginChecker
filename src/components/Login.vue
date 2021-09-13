<template>
<div id="app" align="center" >
  <div class="q-gutter-y-md column" align="center" style="width: 80vw" > <!-- style="max-width: 600px">-->
    <div class="q-pa-md q-gutter-sm">
      <div class="text-h6">
        Log In
        <q-badge align="top">kopoChecker v1.0.0</q-badge>
      </div>
      
      <div id="textInput" ref="textInput">
      <q-input color="orange" filled v-model="text" label="Email ID" id="email">
        <template v-if="text" v-slot:append>
          <q-icon name="cancel" @click.stop="text = null" class="cursor-pointer"></q-icon>
        </template>
      </q-input>
      <q-input color="orange" v-model="password" filled :type="isPwd ? 'password' : 'text'" label="Password">
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      </div>

      <div align=left>
        <q-checkbox v-model="rememberme" label="Remembe Me" id="remem"></q-checkbox>
      </div>
      <q-btn :loading="myloading" color="primary" @click="simulateProgress()" :style="{width: textInputWidth+'px'}">
        Log in
        <template v-slot:myloading>
          <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
          Loading...
        </template>
      </q-btn>
      <q-space/>
      <router-link to="/signup" > <!-- style="text-decoration: none" -->
        <center>New User? Click Here to Register.</center>
      </router-link>
      <router-link to="/forgotid" >
        <center> Forgot Password? </center>
      </router-link>
      <div class="q-pa-md q-gutter-md">
      <q-btn padding="none" flat>
          <img src="../assets/google.png" style="width: 200px; height: 32px;" @click="googlelogin">
      </q-btn>
      <q-btn padding="none" flat>
          <img src="../assets/github.png" style="width: 200px; height: 32px;" @click="githublogin">
      </q-btn>
      <q-btn padding="none" flat>
          <img src="../assets/facebook.png" style="width: 200px; height: 32px;" @click="facebooklogin">
      </q-btn>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {auth, g_auth, db} from "src/boot/firebase"
import axios from 'axios';

export default {
  name: 'login',
  data() {
    return {
      isPwd : true,
      password : '',
      text : '',
      myloading : false,
      rememberme : false,
      rmCheck : null,
      emailInput : null,
      kakaoToken : '',
      textInputWidth : 0
    }
  },
  components: {
  },
  updated() {
    console.log("updated34 called")
    
  },
  created() {
     console.log("created12 called")
  },
  mounted() {
     console.log("mounted12 called")
    this.textInputWidth = this.$refs.textInput.clientWidth
    console.log(this.textInputWidth)

    this.rmCheck = document.getElementById("remem");
    this.emailInput = document.getElementById("email");
    if (localStorage.checkbox && localStorage.checkbox !== "") {
      // this.rmCheck.setAttribute("checked", "checked");
      this.rememberme = true;
      this.text = localStorage.username;
    } else {
      // this.rmCheck.removeAttribute("checked");
      // this.emailInput.value = "";
      this.rememberme = false;
    }
  },
  methods: {
    simulateProgress: function () {
      // we set loading state
      this.myloading = true

      if (this.rememberme == true) {
            localStorage.username = this.text;
            localStorage.checkbox = this.rememberme;
      } else {
            localStorage.username = "";
            localStorage.checkbox = "";
      }

      auth.signInWithEmailAndPassword(this.text, this.password).then(
        (userCredential) => {
          console.log(userCredential.user);
          this.$store.commit("setFireUser", userCredential.user);
          this.$router.push({ path: 'home' })
        }
      ).catch(
        (err) => {
          console.log(err.code);
          console.log(err.message);
          this.$store.commit("setFireError", err.message);
          this.$q.notify({
            message: err.message,
            color: 'purple'
          })
        }
      )
      // simulate a delay
      setTimeout(function () { this.myloading = false }.bind(this), 1000)

    },

    kakaoLogin() {
                // console.log(window.Kakao);
                // this.$alert('인증 확인 중');
                window.Kakao.Auth.login({
                    scope: 'profile_nickname,account_email', //, gender', https://developers.kakao.com/docs/latest/ko/kakaologin/common#user-info
                    success: this.GetMe,
                    fail: this.FailMe,
                });
    }, 
    FailMe(er) {
                console.error(er);
    },
    GetMe(authObj) {
                console.log(authObj);
                this.kakaoToken = authObj.access_token;
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: res => {
                        const kakao_account = res.kakao_account;
                        const user = {
                            nickname: kakao_account.profile.nickname,
                            email: kakao_account.email,
                            password: '',
                            account_type: 2,
                        };
                        console.log(user);
                    },
                    fail: error => {
                        // this.$router.push('/errorPage');
                         this.$q.notify({message: error, color: 'red'})
                        console.log(error);
                    }
                });
      },
    googlelogin(){
         const _this = this;

      var provider = new g_auth.GoogleAuthProvider();
      // 로그인 팝업창을 띄웁니다.
      // provider.setCustomParameters({
      //   'display': 'popup'
      // });
      console.log("FFF cordova",this.$q.platform.is.cordova)
      if (this.$q.platform.is.cordova == true){
          auth.signInWithRedirect(provider).then(() => {
            return auth.getRedirectResult();
          }).then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            console.log(user);
                this.$store.commit("setFireUser", user);

              db.collection("users").where("id", "==", user.email)
              .get()
              .then((querySnapshot) => {
                  if(querySnapshot.empty == true){
                    db.collection("users").add({
                        id: user.email,
                        name: user.displayName
                    })
                  } else {
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        db.collection("users").doc(doc.id).set({
                            id: user.email,
                            name: user.displayName,
                        })
                    });
                  }
              })
              this.$router.push({ path: 'home' })
            // ...
          }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
          });
      }else{
          auth.signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
            console.log(user);
              // _this.$router.push("/profile");
              this.$store.commit("setFireUser", user);

              db.collection("users").where("id", "==", user.email)
              .get()
              .then((querySnapshot) => {
                  if(querySnapshot.empty == true){
                    db.collection("users").add({
                        id: user.email,
                        name: user.displayName
                    })
                  } else {
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        db.collection("users").doc(doc.id).set({
                            id: user.email,
                            name: user.displayName,
                        })
                    });
                  }
              })
              this.$router.push({ path: 'home' })
          }.bind(this)).catch(function(error) {
            // Handle Errors here.
            // var errorCode = error.code;
            var errorMessage = error.message;
            console.log("google auth error : ",errorMessage)
          });
      }
    }, // end of googlelogin
    githublogin(){
      var provider = new g_auth.GithubAuthProvider();
            console.log("GGG cordova",this.$q.platform.is.cordova)

       if (this.$q.platform.is.cordova == true){
          console.log("HERE@")
          auth.signInWithRedirect(provider).then(() => {
            console.log("HERE?")
            return auth.getRedirectResult();
          }).then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            console.log(user);
                this.$store.commit("setFireUser", user);

              db.collection("users").where("id", "==", user.email)
              .get()
              .then((querySnapshot) => {
                  if(querySnapshot.empty == true){
                    db.collection("users").add({
                        id: user.email,
                        name: user.displayName
                    })
                  } else {
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        db.collection("users").doc(doc.id).set({
                            id: user.email,
                            name: user.displayName,
                        })
                    });
                  }
              })
              this.$router.push({ path: 'home' })
            // ...
          }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
          });
      }else{    
                    console.log("HERE??")

          auth.signInWithPopup(provider)
          .then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            var token = credential.accessToken;

            // The signed-in user info.
            var user = result.user;

            console.log("github user >>", user)
            // ...
              this.$store.commit("setFireUser", user);

              db.collection("users").where("id", "==", user.email)
              .get()
              .then((querySnapshot) => {
                  if(querySnapshot.empty == true){
                    db.collection("users").add({
                        id: user.email,
                        name: user.displayName
                    })
                  } else {
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        db.collection("users").doc(doc.id).set({
                            id: user.email,
                            name: user.displayName,
                        })
                    });
                  }
              })
              this.$router.push({ path: 'home' })

          }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            console.log(errorMessage)
            // ...
          });
      }
    },

    facebooklogin(){
      var provider = new g_auth.FacebookAuthProvider();
      
       if (this.$q.platform.is.cordova == true){
          auth.signInWithRedirect(provider).then(() => {
            return auth.getRedirectResult();
          }).then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            console.log(user);
                this.$store.commit("setFireUser", user);

              db.collection("users").where("id", "==", user.email)
              .get()
              .then((querySnapshot) => {
                  if(querySnapshot.empty == true){
                    db.collection("users").add({
                        id: user.email,
                        name: user.displayName
                    })
                  } else {
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        db.collection("users").doc(doc.id).set({
                            id: user.email,
                            name: user.displayName,
                        })
                    });
                  }
              })
              this.$router.push({ path: 'home' })
            // ...
          }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
          });
      }else{
          auth.signInWithPopup(provider)
          .then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            var token = credential.accessToken;

            // The signed-in user info.
            var user = result.user;

            console.log("facebook user >>", user)
            // ...
              this.$store.commit("setFireUser", user);

              db.collection("users").where("id", "==", user.email)
              .get()
              .then((querySnapshot) => {
                  if(querySnapshot.empty == true){
                    db.collection("users").add({
                        id: user.email,
                        name: user.displayName
                    })
                  } else {
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        db.collection("users").doc(doc.id).set({
                            id: user.email,
                            name: user.displayName,
                        })
                    });
                  }
              })
              this.$router.push({ path: 'home' })

          }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            console.log(errorMessage)
            // ...
          });
      }
    }
    
  }
}
</script>
