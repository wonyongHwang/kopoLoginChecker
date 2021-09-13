<template>
  <div id="app" align="center">
  <div class="q-gutter-y-md column" align="center" style="width: 80vw">
    <div class="q-pa-md q-gutter-sm" >
      <div class="text-h6">
        Reset Password
        <q-badge align="top">kopoChecker v1.0.0</q-badge>
      </div>
    
      <div id="textInput" ref="textInput">
      <q-input color="orange" filled v-model="text" label="Email ID" >
        <template v-if="text" v-slot:append>
          <q-icon name="cancel" @click.stop="text = null" class="cursor-pointer"></q-icon>
        </template>
      </q-input>
      </div>

      
      
      <q-btn :loading="myloading" color="primary" @click="simulateProgress()" :style="{width: textInputWidth+'px'}">
        Reset Password
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
import {auth} from "src/boot/firebase"

export default {
  name: 'forgotid',
  data() {
    return {
      text : '',
      myloading : false,
      textInputWidth : 0
    }
  },
  mounted() {
    this.textInputWidth = this.$refs.textInput.clientWidth
    console.log(this.textInputWidth)
  },
  methods: {
    simulateProgress: function () {
      // we set loading state
      this.myloading = true
      if (!this.text) {
       this.$q.notify({
              message: "Input your e-mail",
              color: 'red'
            })
      } else {
        auth.sendPasswordResetEmail(this.text)
        .then(() => {
          // Password reset email sent!
          this.$q.notify({
              message: "Password reset email sent!",
              color: 'purple'
            })
        })
        .catch((error) => {
          // var errorCode = error.code;
          // var errorMessage = error.message;
          this.$q.notify({
              message: error.message,
              color: 'purple'
            })
        });
      }
      
      // simulate a delay
      setTimeout(function () { this.myloading = false }.bind(this), 1000)

    }
  }
}
</script>
