<template>

<div id="app" align="center" >
<div class="q-gutter-y-md column" align="center" style="width: 80vw" >
  <div class="q-pa-md q-gutter-sm" >
      <div class="text-h6">
        Sign Up
        <q-badge align="top">kopoChecker v1.0.0</q-badge>
      </div>
      <div class="q-pa-md" v-if="validationErrors.length">
        <q-card class="my-card">
          <q-card-section>
            <div class="text-h6">
              <div class="text-subtitle2">
                Please resolve the following error(s) before proceeding.
                <ul style="margin-top:0.3em; margin-left: 0.1em">
                  <li
                    v-for="(error, index) in validationErrors"
                    :key="`error-${index}`"
                    v-html="error"
                  />
                </ul>
              </div>
            </div>
            <q-btn outline rounded color="primary" icon="delete_forever" @click="resetError()" label="Clear"></q-btn>
          </q-card-section>
        </q-card>
      </div>
  
      <q-input color="orange" filled v-model="text" label="Email ID">
        <template v-if="text" v-slot:append>
          <q-icon name="cancel" @click.stop="text = null" class="cursor-pointer"></q-icon>
        </template>
      </q-input>
       <q-input color="orange" filled v-model="name" label="Your name">
        <template v-if="name" v-slot:append>
          <q-icon name="cancel" @click.stop="name = null" class="cursor-pointer"></q-icon>
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
      <q-input color="orange" v-model="passwordRepeat" filled :type="isPwdRpt ? 'password' : 'text'" label="Repeat Password">
        <template v-slot:append>
          <q-icon
            :name="isPwdRpt ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwdRpt = !isPwdRpt"
          />
        </template>
      </q-input>
      <q-btn :loading="myloading" color="primary" @click="validate()" style="width: 99%">
      Sign Up
      <template v-slot:myloading>
        <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
        Loading...
      </template>
      </q-btn>
      <q-space/>
      <router-link to="/login" > <!-- style="text-decoration: none" -->
        <center>Move to Login Form</center>
      </router-link>

  </div>
</div>
</div>
</template>

<script>
import {auth, db} from "src/boot/firebase"

export default {
  name: 'signup',
  data() {
    return {
      isPwd : true,
      isPwdRpt : true,
      password : null,
      passwordRepeat: null,
      text : '',
      myloading : false,
      name : '',
      validationErrors: []
    }
  },
  methods: {
    resetError() {
      this.validationErrors = [];
    },
    validate() {
      // Clear the errors before we validate again
      this.resetError();
      // email validation
      if (!this.text) {
        this.validationErrors.push("<strong>E-mail</strong> cannot be empty.");
      }
      if (/.+@.+/.test(this.text) != true) {
        this.validationErrors.push("<strong>E-mail</strong> must be valid.");
      }
      // name validatioin
      if (!this.password) {
        this.validationErrors.push("<strong>Password</strong> cannot be empty");
      }
      // password validation
      if (!this.name) {
        this.validationErrors.push("<strong>Name</strong> cannot be empty");
      }
      if (/.{6,}/.test(this.password) != true) {
        this.validationErrors.push(
          "<strong>Password</strong> must be at least 6 characters long"
        );
      }
      if(!(this.password === this.passwordRepeat)) {
        this.validationErrors.push(
          "<strong>Passwords</strong> did not match"
        );
      }
      // when valid then sign in
      if (this.validationErrors.length <= 0) {
        this.signup();
      }
    },
    signup: function () {
      // we set loading state
      this.myloading = true
       
      auth.createUserWithEmailAndPassword(this.text, this.password).then(
        (userCredential) => {
          console.log(userCredential.user);
          this.$store.commit("setFireUser", userCredential.user);

          // firestore insert (fireauth have already checked if there is same id, so simply we insert a data w/o check integrity)
          db.collection("users").add({
              id: this.text,
              name: this.name
          })
          .then((docRef) => {
              console.log("Document written with ID: ", docRef.id);
              this.$q.notify({
                message: "Register Success",
                color: 'blue'
              })
          })
          .catch((error) => {
              console.error("Error adding document: ", error);
              this.$q.notify({
                message: error,
                color: 'red'
              })
          });


          this.$router.push({ path: 'home' })

        }).catch((err) => {
          console.log(err.code);
          console.log(err.message);
          this.$store.commit("setFireError", err.message);
          this.$q.notify({
            message: err.message,
            color: 'purple'
          })
        });
      
      // simulate a delay
      setTimeout(function () { this.myloading = false }.bind(this), 1000)

    }
  }
}
</script>
<style lang="scss">
// .my-card {
//   width: 100%;
//   max-width: 1000px;
// }
// .q-pa-md {
//   width: 100%;
//   max-width: 500px;
// }
</style>