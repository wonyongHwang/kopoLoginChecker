
<template>
  <div id="app" align="center">
  <div class="q-gutter-y-md column"  align="center" style="width: 80vw">
    <div class="q-pa-md q-gutter-sm" >
      <!-- <div class="text-h6" align="center">
        Check In
      </div> -->
      <section v-if="!isUserAuth && !qrimg">
        <!-- <div class="col-6" align="center">
          <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
            <div class="absolute-full text-subtitle2 flex flex-center">
              Welcome
            </div>
          </q-img>
        </div> -->
        <q-carousel v-model="slide" transition-prev="scale" transition-next="scale" swipeable animated control-color="white" navigation padding arrows height="300px" :autoplay="2500" :infinite="true" class="bg-primary text-white shadow-1 rounded-borders">
        <q-carousel-slide name="style" class="column no-wrap flex-center">
          <q-icon name="login" size="56px"></q-icon>
          <div class="q-mt-md text-center">
            {{ step1 }}
          </div>
        </q-carousel-slide>
        <q-carousel-slide name="tv" class="column no-wrap flex-center">
          <q-icon name="thermostat" size="56px"></q-icon>
          <div class="q-mt-md text-center">
            {{ step2 }}
          </div>
        </q-carousel-slide>
        <q-carousel-slide name="layers" class="column no-wrap flex-center">
          <q-icon name="qr_code_scanner" size="56px"></q-icon>
          <div class="q-mt-md text-center">
            {{ step3 }}
          </div>
        </q-carousel-slide>
        <q-carousel-slide name="map" class="column no-wrap flex-center">
          <q-icon name="check_circle" size="56px"></q-icon>
          <div class="q-mt-md text-center">
            {{ step4 }}
          </div>
        </q-carousel-slide>
      </q-carousel>
      </section>
      <section v-if="isUserAuth && !qrimg" class="section">
        <div class="columns">
          <div class="column is-half is-offset-one-quarter">
            <div class="text-h6" align="center">
            Hi, {{ this.name }}({{ getFireUser.email }})
            <br>
            Check your temperature and get your QR code.      
            </div>    
          </div>
          <p></p>
          <p></p>
          <p></p>
          <!-- <div class="q-pa-md" align="left">
            <q-option-group :options="options" type="radio" v-model="group" ></q-option-group>
          </div> -->
          <round-slider v-bind:change="chgHandler" v-on:input="pInput" v-model="sliderValue" min=31.5 max=41.5 step=0.1 value=36.5 start-angle=20 end-angle=160 >
          </round-slider>
          <q-btn :loading="myloading" color="primary" @click="qrgen()" style="width: 100%">
            Generate QR Code
            <template v-slot:myloading>
              <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
              Loading...
            </template>
          </q-btn>
        </div>
      </section>
      <section v-else-if="!isUserAuth">
      <router-link to="/login" style="text-decoration: none">
        <q-btn outline rounded color="primary"  style="width: 100%">
          Please LogIn 
        </q-btn>
        </router-link>
      </section>
      <div align="center">
        <q-img v-if="qrimg" :src="this.qrimg" spinner-color="white" style="width: 300px"></q-img> <!-- width: 80%; max-width: 300px margin-left: 1em; -->
        <section v-if="isUserAuth">
          <q-btn @click="signOut" class="button is-primary" label="Log Out" style="width: 100%"/>
        </section>
        <section v-if="isUserAuth && qrimg">
          <q-btn @click="reCheck" class="button is-primary" label="ReCheck" style="width: 100%"/>
        </section>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
// import Vue from 'vue'
// import { QrcodeStream } from "vue-qrcode-reader/src/index.js"

import { RoundSlider } from "vue-round-slider/src/index2.js"

import { mapGetters, mapActions } from "vuex";
import { db } from "src/boot/firebase"
import QRCode from 'qrcode'

export default {
// el: "#app",
  data() {
    return {
      name: '',
      qrimg: null,
      group: 'normal',
      myloading : false,
      docid : null,
      sliderValue: 36.5,
      options: [
        { label: 'Below 36.5°C', value: 'hypothermal' },
        { label: 'Between 36.5°C and 37.4°C', value: 'normal', color: 'green' },
        { label: 'Above 37.4°C', value: 'hyperthermia', color: 'red' }
      ],
      slide : 'style',
      step1 : '[STEP 1] Please log in with your username and password.',
      step2 : '[STEP 2] Adjust a Round-Slider control to your temperature and click the "GENERATE QR CODE" button.',
      step3 : '[STEP 3] Scan the QR Code on our Scanner. (Issued QR code is unique and valid for 5 minutes)',
      step4 : '[STEP 4] If QR code accepted successfully, you can see success message on a QR scanner.'

    }
  },
  components: {
    RoundSlider,
  },
  updated() {
    if(this.getFireUser != null && this.name == ''){
      db.collection("users").where("id", "==", this.getFireUser.email )
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
    }
  },
  mounted() {
    this.authAction();
    if(this.getFireUser != null){
      db.collection("users").where("id", "==", this.getFireUser.email )
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
    }

    
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
    reCheck() {
      this.qrimg = null
      this.$router.push({ path: 'home' })
    },
    pInput(value){
      console.log("value>>>",value)
      this.sliderValue = value
    },
    chgHandler(){
        
        // var x = $('"rs-tooltip.rs-tooltip-text.rs-edit"').text();
        console.log("chgHandler called ")
    },
    qrgen(){
      console.log('sliderValue opt => ', this.sliderValue)
     
      var cdate = Date.now()
      // firestore insert => then we can get doc id to generate qr code
      db.collection("qrgen").add({
              date: cdate,
              id: this.getFireUser.email,
              status: this.sliderValue //this.group
          })
          .then((docRef) => {
              // console.log("Document written with ID: ", docRef.id);
              this.docid = docRef.id
              var data = this.getFireUser.email + '/' + cdate + '/' + this.sliderValue + '/' + this.docid
              QRCode.toDataURL(data)
              .then(url => {
                // console.log(url)
                this.qrimg = url
              })
              .catch(err => {
                console.error(err)
              })
          })
          .catch((error) => {
              console.error("Error adding document: ", error);
          });

      // With promises

      
    }
  }
};
</script>