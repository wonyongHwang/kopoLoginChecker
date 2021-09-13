
<template>
  <div id="app" align="center">
  <div class="q-gutter-y-md column"  align="center" style="width: 80vw">
    <div class="q-pa-md q-gutter-sm" >
      <!-- <div class="text-h6" align="center">
        Check In
      </div> -->
     
      <section v-if="isUserAuth" class="section">
        <q-card class="my-card text-white" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">
          <q-card-section>
            <div class="text-h6">Account Information</div>
            <div class="text-subtitle2">Thanks for your cooperation</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            Name : {{ name }} <p></p>
            ID : {{ email }} <p></p>
            Creation Date : {{ creationTime }} <p></p>
            Last Login Date : {{ lastSignInTime }} <p></p>
          </q-card-section>
        </q-card>
        <div>
         <p></p>
        </div>
        <q-btn outline label="Delete My Account" color="primary" @click="confirm" style="width: 100%"></q-btn>

      </section>
      <section v-else-if="!isUserAuth">
      <router-link to="/login" style="text-decoration: none">
        <q-btn outline rounded color="primary"  style="width: 100%">
          Please LogIn 
        </q-btn>
        </router-link>
      </section>
      
    </div>
  </div>
  </div>
</template>
<script>
// import Vue from 'vue'
// import { QrcodeStream } from "vue-qrcode-reader/src/index.js"


import { mapGetters, mapActions } from "vuex";
import { db, auth, g_auth } from "src/boot/firebase"
// import { useQuasar } from 'quasar'

export default {
// el: "#app",
  data() {
    return {
      name: '',
      email: '',
      creationTime: '',
      lastSignInTime: ''
    }
  },
  components: {
  },
  updated() {
    
  },
  mounted() {
    this.authAction();
    if(this.getFireUser != null){
      
    }

    
  },
  created() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        console.log("user>>> ",user)
        this.email = user.email;
        // user.displayName
        this.creationTime = user.metadata.creationTime
        this.lastSignInTime = user.metadata.lastSignInTime
        
        db.collection("users").where("id", "==", user.email )
          .get()
          .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                  // doc.data() is never undefined for query doc snapshots
                  console.log(doc.id, " => ", doc.data());
                  this.name = doc.data().name
              });
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          });
      } else {
        // User is signed out
        // ...
      }
    });
  },
  computed: {
    ...mapGetters(["getFireUser", "isUserAuth"])
  },
  
  methods: {
    ...mapActions(["signOutAction","authAction"]),
    signOut() {
      // this.name = '' // this line calling updated(), so I commented.
      this.signOutAction()
      this.$router.push({ path: 'login' })
    },
    deleteUserInfo(user){
      var _this = this;
      return new Promise(function(resolve, reject){
        db.collection("users").where("id", "==", user.email )
          .get()
          .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                  // doc.data() is never undefined for query doc snapshots
                  console.log(doc.id, " => ", doc.data());
                  db.collection("users").doc(doc.id).delete().then(() => {
                      console.log("Document successfully deleted!");
                      resolve('1')
                  }).catch((error) => {
                      console.error("Error removing document: ", error);
                  });
                 
              });
              
          })
          
      })
   
    },
    confirm () {
      this.$q.dialog({
        title: 'Warning',
        message: 'Would you like to Delete Your Account?<br/>This action can not be undone.',
        html: true,
        cancel: true,
        persistent: true
      }).onOk(() => {
         console.log('>>>> OK')
      }).onOk(() => {
          console.log('>>>> second OK catcher>>cordova?',cordova)
          const user = auth.currentUser;

          if (user.providerData[0].providerId == "google.com"){

            if (this.$q.platform.is.cordova == true){
                user.reauthenticateWithRedirect(new g_auth.GoogleAuthProvider()).then((UserCredential) => {
                    console.log("re-outh", UserCredential);
                    this.deleteUserInfo(user).then((res)=>{
                          console.log("fin"+res)
                          user.delete().then(() => {
                              // User deleted.
                              this.$q.notify({
                                message: 'Your Account has been deleted',
                                color: 'blue',
                                icon: 'warning'
                              })
                            }).catch((error) => {
                              this.$q.notify({
                                message: 'There is a error while deleting your account.',
                                color: 'red',
                                icon: 'warning'
                              })
                            });
                      })
              });
            }else{
                user.reauthenticateWithPopup(new g_auth.GoogleAuthProvider()).then((UserCredential) => {
                    console.log("re-outh", UserCredential);
                    this.deleteUserInfo(user).then((res)=>{
                          console.log("fin"+res)
                          user.delete().then(() => {
                              // User deleted.
                              this.$q.notify({
                                message: 'Your Account has been deleted',
                                color: 'blue',
                                icon: 'warning'
                              })
                            }).catch((error) => {
                              this.$q.notify({
                                message: 'There is a error while deleting your account.',
                                color: 'red',
                                icon: 'warning'
                              })
                            });
                      })
              });
            }
          } // end of if ..
          else if(user.providerData[0].providerId == "github.com"){
                if (this.$q.platform.is.cordova == true){
                    user.reauthenticateWithRedirect(new g_auth.GithubAuthProvider()).then((UserCredential) => {
                        console.log("re-outh", UserCredential);
                        this.deleteUserInfo(user).then((res)=>{
                              console.log("fin"+res)
                              user.delete().then(() => {
                                  // User deleted.
                                  this.$q.notify({
                                    message: 'Your Account has been deleted',
                                    color: 'blue',
                                    icon: 'warning'
                                  })
                                }).catch((error) => {
                                  this.$q.notify({
                                    message: 'There is a error while deleting your account.',
                                    color: 'red',
                                    icon: 'warning'
                                  })
                                });
                          })
                    });

                }else{
                    user.reauthenticateWithPopup(new g_auth.GithubAuthProvider()).then((UserCredential) => {
                        console.log("re-outh", UserCredential);
                        this.deleteUserInfo(user).then((res)=>{
                              console.log("fin"+res)
                              user.delete().then(() => {
                                  // User deleted.
                                  this.$q.notify({
                                    message: 'Your Account has been deleted',
                                    color: 'blue',
                                    icon: 'warning'
                                  })
                                }).catch((error) => {
                                  this.$q.notify({
                                    message: 'There is a error while deleting your account.',
                                    color: 'red',
                                    icon: 'warning'
                                  })
                                });
                          })
                    });
                }
              
          } // end of else if
          else if(user.providerData[0].providerId == "facebook.com"){
              if (this.$q.platform.is.cordova == true){
                      user.reauthenticateWithRedirect(new g_auth.FacebookAuthProvider()).then((UserCredential) => {
                      console.log("re-outh", UserCredential);
                      this.deleteUserInfo(user).then((res)=>{
                            console.log("fin"+res)
                            user.delete().then(() => {
                                // User deleted.
                                this.$q.notify({
                                  message: 'Your Account has been deleted',
                                  color: 'blue',
                                  icon: 'warning'
                                })
                              }).catch((error) => {
                                this.$q.notify({
                                  message: 'There is a error while deleting your account.',
                                  color: 'red',
                                  icon: 'warning'
                                })
                              });
                        })
                  });
              }else{
                    user.reauthenticateWithPopup(new g_auth.FacebookAuthProvider()).then((UserCredential) => {
                      console.log("re-outh", UserCredential);
                      this.deleteUserInfo(user).then((res)=>{
                            console.log("fin"+res)
                            user.delete().then(() => {
                                // User deleted.
                                this.$q.notify({
                                  message: 'Your Account has been deleted',
                                  color: 'blue',
                                  icon: 'warning'
                                })
                              }).catch((error) => {
                                this.$q.notify({
                                  message: 'There is a error while deleting your account.',
                                  color: 'red',
                                  icon: 'warning'
                                })
                              });
                        })
                  });
              }
          } // end of else if
          else if (user.providerData[0].providerId == "password" ){
              this.$q.dialog({
                title: 'Confirmation',
                message: 'Input Your Password',
                prompt: {
                  model: '',
                  type: 'password' // optional
                },
                cancel: true,
                persistent: true
              }).onOk(data => {
                // console.log('>>>> OK, received', data)
                var credentials = g_auth.EmailAuthProvider.credential(
                  user.email,
                  data
                );
                user.reauthenticateWithCredential(credentials).then(() => {
                    // User re-authenticated.
                    this.deleteUserInfo(user).then((res)=>{
                      console.log("fin"+res)
                       user.delete().then(() => {
                          // User deleted.
                          this.$q.notify({
                            message: 'Your Account has been deleted',
                            color: 'blue',
                            icon: 'warning'
                          })
                        }).catch((error) => {
                          this.$q.notify({
                            message: 'There is a error while deleting your account.',
                            color: 'red',
                            icon: 'warning'
                          })
                        });
                    })
                       
                  }).catch((error) => {
                    console.log(error)
                    this.$q.notify({
                          message: 'There is a error while reAuthenticating your account.<br/> Check Your Password Again.',
                          html: true,
                          color: 'red',
                          icon: 'warning'
                        })
                  });
              }).onCancel(() => {
                // console.log('>>>> Cancel')
              }).onDismiss(() => {
                // console.log('I am triggered on both OK and Cancel')
              })
          } // end of else if...
          
          

          
      }).onCancel(() => {
        console.log('>>>> Cancel')
        this.$q.notify({
                  message: 'Deleting Account is canceled ',
                  color: 'blue',
                  icon: 'warning'
                })
      }).onDismiss(() => {
        console.log('I am triggered on both OK and Cancel')
        
          
      })
    }
   
    
  }
};
</script>