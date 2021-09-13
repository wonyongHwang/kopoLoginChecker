<template>
<div id="app" align="center">
  <div class="q-gutter-y-md column" style="max-width: 600px">
    <div class="q-pa-md q-gutter-sm">
      <section v-if="admOrg">
        <p class="error">{{ error }}</p>
        <div class="text-h7">
        Organization: {{ admOrg }}
        </div>
        <p></p>
        <p></p>
        <p class="decode-result" align="left" v-bind:style="{ 'color': activeColor, fontSize: fontSize + 'px', 'font-weight':fontweight}">
          Last result: <b>{{ result }}</b></p>

        <div class="q-gutter-md row items-center" v-if="loading">
              <q-spinner-cube size=xl color="primary" style="width: 97%; height: 97%"></q-spinner-cube>
        </div>

        <qrcode-stream :camera="camera" @decode="onDecode" @init="onInit" :key="componentKey"/>
        <section v-if="isUserAuth">
          <q-btn @click="signOut" class="button is-primary" label="Admin Log Out" style="width: 100%"/>
         </section>
        <!-- <div class="loading-indicator" v-if="loading">
            Loading...
        </div> -->
      </section>
      <section v-else-if="inProgress">
        <div align="center">Account Checking...</div>
        <div align="center">
          <q-circular-progress indeterminate size="90px" :thickness="0.2" color="lime" center-color="grey-8" track-color="transparent" class="q-ma-md" align="center">
          </q-circular-progress>
        </div>
      </section>
      <section v-else-if="!admOrg && !inProgress">
        <div class="text-h6">
        You need to be log-in as a administrator.
        </div>
        <q-input color="orange" filled v-model="text" label="Email ID" id="email">
          <template v-if="text" v-slot:append>
            <q-icon name="cancel" @click.stop="text = null" class="cursor-pointer"></q-icon>
          </template>
        </q-input>
        <q-space/>
        <q-input color="orange" v-model="password" filled :type="isPwd ? 'password' : 'text'" label="Password">
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <q-btn :loading="myloading" color="primary" @click="simulateProgress()" style="width: 100%" >
          Log in
          <template v-slot:myloading>
            <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
            Loading...
          </template>
        </q-btn>
        <div class="q-pa-md q-gutter-md">
        <q-btn padding="none" flat>
            <img src="../assets/google.png" style="width: 200px;" @click="googlelogin">
        </q-btn>
        <q-btn padding="none" flat>
            <img src="../assets/github.png" style="width: 200px;" @click="githublogin">
        </q-btn>
        </div>
      </section>
    </div>
  </div>
</div>
</template>


<script>
import { QrcodeStream } from "vue-qrcode-reader/src/index.js"
import { db } from "src/boot/firebase"
import { mapGetters, mapActions } from "vuex";
import {auth,g_auth} from "src/boot/firebase"

export default {
  name: 'PageIndex',
  components: { QrcodeStream },
  data () {
    return {
      camera: 'front',
      result: '',
      error: '',
      loading: false,
      admOrg: '',
      isPwd : true,
      text : '',
      password : '',
      myloading : false,
      inProgress : true,
      name: '',
      activeColor : 'black',
      fontSize : 15,
      fontweight : 'normal',
      componentKey : 0
    }
  },
  computed: {
    ...mapGetters(["getFireUser", "isUserAuth"])
  },
  mounted() {
    
  },
  updated() {
    
  },
  created() { 
      auth.onAuthStateChanged((user) => {
            if (user) {
                // this.userVal = true;
                console.log('User is logined', user);
                // update data or vuex state
                this.authAction();
                if(user != null){
                  db.collection("admin").where("id", "==", user.email )
                  .get()
                  .then((querySnapshot) => {
                      this.inProgress = false
                      querySnapshot.forEach((doc) => {
                          console.log(doc.id, " => ", doc.data());                          
                          this.admOrg = doc.data().org
                          
                      });
                  })
                  .catch((error) => {
                      console.log("Error getting documents: ", error);
                  });
                }
            } else {
                this.inProgress = false;
                console.log('User is not logged in.');
            }
        });
  },
  methods: {
    ...mapActions(["signOutAction","authAction"]),
    signOut() {
      // this.name = '' // this line calling updated(), so I commented.
      this.signOutAction()
      this.admOrg=''
      this.inProgress=true
      this.password=''
      this.$router.push({ path: 'qrscanner' })
    },
    onDecode (result) {
      // split with '/'  
      this.result = result
      // ex> c@c.com/1626853034866/hyperthermia/WW4vTYeqBOAJnaC1jNwT
      const words = result.split('/');
      for (let i = 0; i < words.length; i++) {
        console.log(words[i])
      }
      // firestore select to check doc-id 
      var docRef = db.collection("qrgen").doc(words[3]);

      docRef.get().then((doc) => {
          if (doc.exists) {
              console.log("Document data:", doc.data());
              var millis = Date.now() - words[1];
              millis = Math.floor(millis / 1000)
              console.log('seconds elapsed = ',millis);
              if (millis > 300){
                // expired, show some message
                this.$q.notify({
                        message: "Expired QR Code.(exceeds 5 min.)",
                        color: 'red'
                      })
                this.result = "Expired QR Code.(exceeds 5 min.)"
                // this.componentKey += 1
                return
              } 
              
              // 성명조회
              db.collection("users").where("id", "==", words[0] )
              .get()
              .then((querySnapshot) => {
                  querySnapshot.forEach((doc) => {
                      console.log(doc.id, " => ", doc.data());
                      this.name = doc.data().name
                      // var timeElapsed = Date.now();
                      // var today = new Date();
                      // firestore insert (id/time/temperature/)
                      db.collection("checkin").add({
                          id: words[0],
                          name: this.name,
                          temperature: words[2],
                          time: Date.now() // today // today.toUTCString()
                      })
                      .then((docRef) => {
                          console.log("Document written with ID: ", docRef.id);
                          this.$q.notify({
                            message: "Success",
                            color: 'blue'
                          })
                          this.result = "QR Check-in Success"
                          this.sucEffect("success")
                      })
                      .catch((error) => {
                          this.$q.notify({
                            message: "Check In Error in Database",
                            color: 'red'
                          })
                          this.result = ""
                          console.error("Error adding document: ", error);
                      });
                  });
              })
              .catch((error) => {
                // 유저 정보 없음, 에러 메시지 필요
                  console.log("Error getting documents: ", error);
                  this.$q.notify({
                        message: "User Information Not Found",
                        color: 'red'
                      })
                  this.result = ""    
                  
              });

          } else {
              // 발급 이력 없음, 에러 메세지 발생 필요
              console.log("No such document!");
              this.$q.notify({
                        message: "This QR has not been issued.",
                        color: 'red'
                      })
              this.result = ""
          }
      }).catch((error) => {
          console.log("Error getting document:", error);
      });
      
      // this.componentKey += 1

    },

    async onInit (promise) {
      try {
        this.loading = true
        await promise
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = "ERROR: you need to grant camera access permisson"
        } else if (error.name === 'NotFoundError') {
          this.error = "ERROR: no camera on this device"
        } else if (error.name === 'NotSupportedError') {
          this.error = "ERROR: secure context required (HTTPS, localhost)"
        } else if (error.name === 'NotReadableError') {
          this.error = "ERROR: is the camera already in use?"
        } else if (error.name === 'OverconstrainedError') {
          // this.error = "ERROR: installed cameras are not suitable. Finding Suitable Camera..."
          console.log('Installed cameras are not suitable. Finding Suitable Camera.')
          this.camera = 'auto'
          // this.error = ''
          this.$forceUpdate();
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = "ERROR: Stream API is not supported in this browser"
        }
      } finally {
        this.loading = false
      }
    },
    simulateProgress: function () {
      // we set loading state
      this.myloading = true

      auth.signInWithEmailAndPassword(this.text, this.password).then(
        (userCredential) => {
          console.log(userCredential.user);
          
                 // db 확인
                db.collection("admin").where("id", "==", this.text )
                .get()
                .then((querySnapshot) => {
                    if(querySnapshot.empty==true){
                      this.$q.notify({
                        message: "You are not a Administrator",
                        color: 'red'
                      })
                    }
                    querySnapshot.forEach((doc) => {
                        console.log(doc.id, " => ", doc.data());
                        this.$store.commit("setFireUser", userCredential.user);
                        this.admOrg = doc.data().org
                    });
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                }).finally(() => {
                    // do nothing
                });
                
          this.$router.push({ path: 'qrscanner' })
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

    sucEffect(opt){
      if(opt=="success"){
        this.fontweight = "bold"
        this.activeColor = "blue"
        this.fontSize = "25"

        setTimeout(function () { 
          this.fontweight = "normal"
          this.activeColor = "black"
          this.fontSize = "15" 
            }.bind(this), 1000)
          }
      }, // end of sucEffect
    googlelogin(){
         const _this = this;

      var provider = new g_auth.GoogleAuthProvider();
      // 로그인 팝업창을 띄웁니다.
      provider.setCustomParameters({
        'display': 'popup'
      });
      auth.signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log(user);
         // db 확인
          db.collection("admin").where("id", "==", user.email )
          .get()
          .then((querySnapshot) => {
              if(querySnapshot.empty==true){
                this.$q.notify({
                  message: "You are not a Administrator",
                  color: 'red'
                })
                this.signOut()
              }
              querySnapshot.forEach((doc) => {
                  console.log(doc.id, " => ", doc.data());
                  this.$store.commit("setFireUser", userCredential.user);
                  this.admOrg = doc.data().org
              });
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          }).finally(() => {
              // do nothing
          });
          
          this.$router.push({ path: 'qrscanner' })
         
      }.bind(this)).catch(function(error) {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        console.log("google auth error : ",errorMessage)
      });

    }, // end of googlelogin
    githublogin(){
      var provider = new g_auth.GithubAuthProvider();
          
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
         // db 확인
          db.collection("admin").where("id", "==", user.email )
          .get()
          .then((querySnapshot) => {
              if(querySnapshot.empty==true){
                this.$q.notify({
                  message: "You are not a Administrator",
                  color: 'red'
                })
                this.signOut()

              }
              querySnapshot.forEach((doc) => {
                  console.log(doc.id, " => ", doc.data());
                  this.$store.commit("setFireUser", userCredential.user);
                  this.admOrg = doc.data().org
              });
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          }).finally(() => {
              // do nothing
          });
                
          this.$router.push({ path: 'qrscanner' })


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
</script>
