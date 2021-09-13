<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Kopo Checker
        </q-toolbar-title>

        <div>Dept. of Smart Finance</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      
      bordered
      class="bg-grey-1"
    > <!-- show-if-above --> <!-- Forces drawer to be shown on screen on initial render --> 
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Menus
        </q-item-label>
        
        <EssentialLink v-on:closeDrawer="closeme()"
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
         <q-separator></q-separator>
        <EssentialLink v-on:closeDrawer="closeme()"
          v-for="link in subLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'src/components/EssentialLink.vue'
const sublinksList = [
  
  {
    title: 'Privacy Policy',
    caption: 'Privacy Policy',
    icon: 'security',
    link: '/Privacy',
    external: false
  },
   {
    title: 'Open Source License',
    caption: 'OSS',
    icon: 'copyright',
    link: '/oss',
    external: false
  },
  {
    title: 'Author',
    caption: 'Contact Information',
    icon: 'contact_support',
    link: 'https://profile.wonyong.net',
    external: true
  }
];
const linksList = [
  {
    title: 'Home',
    caption: 'Home',
    icon: 'home',
    link: '/home'
  },
  {
    title: 'QR Scanner',
    caption: 'QR Check for Admin',
    icon: 'qr_code_scanner',
    link: 'https://kopologinchecker.web.app/#/qrscanner', //'http://localhost:8080/#/qrscanner', // 'https://kopologinchecker.web.app/#/qrscanner',
    external: true
  },
  {
    title: 'Check-In Status',
    caption: 'QR checked Member List',
    icon: 'how_to_reg',
    link: '/checkstatus',
    external: false
  },
  // {
  //   title: 'QR Check (Admin - Mobile)',
  //   caption: 'QR Check for Admin(Mobile)',
  //   icon: 'qr_code_scanner',
  //   link: 'http://localhost:8080/#/testqr',
  //   external: true
  // },
  // {
  //   title: 'TEST',
  //   caption: 'cam test',
  //   icon: 'record_voice_over',
  //   link: 'http://localhost:8080/#/testcam',
  //   external: true
  // },
  {
    title: 'Facebook',
    caption: 'Our Facebook',
    icon: 'facebook',
    link: 'https://www.facebook.com/fintechit',
    external : true
  },
  
   {
    title: 'Log Out',
    caption: 'Log Out',
    icon: 'logout',
    link: '/logout',
    external: false
  },
   {
    title: 'Account Details',
    caption: '',
    icon: 'manage_accounts',
    link: '/acc',
    external: false
  }

 
];

import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },
  methods: {
    closeme() {
      console.log('event received');
      this.leftDrawerOpen = false;
    }
  },

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      essentialLinks: linksList,
      subLinks: sublinksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
