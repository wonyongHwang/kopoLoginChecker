
<template>
  <div id="app">
  <div class="q-gutter-y-md column" style="max-width: 600px">
    <div class="q-pa-md q-gutter-sm">
      <div class="text-h4" align="center">
        Log Out...
      </div>
      <section v-if="isLoggingOut">
      <div align="center">
          <q-circular-progress indeterminate size="90px" :thickness="0.2" color="lime" center-color="grey-8" track-color="transparent" class="q-ma-md" align="center">
          </q-circular-progress>
      </div>
      </section>
    </div>
  </div>
  </div>
</template>
<script>

import { mapGetters, mapActions } from "vuex";

export default {

  data() {
    return {
     isLoggingOut : true
    }
  },
  updated() {
   
  },
  mounted() {
   
    this.signOut()
    
  },

  computed: {
    ...mapGetters(["getFireUser", "isUserAuth"])
  },
  
  methods: {
    ...mapActions(["signOutAction","authAction"]),
    signOut() {
      // this.name = '' // this line calling updated(), so I commented.
      this.signOutAction()
      this.isLoggingOut = false
      this.$router.push({ path: 'login' })
    },
   
  }
};
</script>