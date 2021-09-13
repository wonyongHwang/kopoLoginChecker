// some Vue file
// remember this is simply an example;
// only look at how we use the API described in the plugin's page;
// the rest of things here are of no importance

<template>
  <div>
    <q-btn color="primary" label="Get Picture" @click="captureImage" />

    <img :src="imageSrc">
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'

export default {
  setup () {
    const $q = useQuasar()
    const imageSrc = ref('')
    const video = ref('')

    function captureImage () {
      let pictureOptions = {
            cameraDirection: Camera.Direction.FRONT,
            saveToPhotoAlbum: false,
            destinationType: Camera.DestinationType.DATA_URL,
            quality: 60 };

      navigator.camera.getPicture( // 모바일 기기 지원 https://cordova.apache.org/docs/ko/3.1.0/cordova/camera/camera.getPicture.html
        data => { // on success
          // imageSrc.value = `data:image/jpeg;base64,${data}`
          this.video = document.createElement("video");
          this.video.srcObject = data;
          this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
          this.video.play();
          
        },
        () => { // on fail
          $q.notify('Could not access device camera.')
        },
        {
          // camera options
          pictureOptions
        }
      )
    }

    return {
      imageSrc,
      captureImage
    }
  }
}
</script>