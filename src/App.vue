<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue';

window.Kakao.init('3a29c795ef10e7373f1a172ccec23c01');

export default defineComponent({
  name: 'App'
})
</script>
