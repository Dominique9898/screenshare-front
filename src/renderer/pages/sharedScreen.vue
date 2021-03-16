<template>
  <div class="sharedScreen">
<!--    <video id="localVideo" class="video" autoplay="autoplay"></video>-->
    <video id="remoteVideo" class="video" autoplay="autoplay"></video>
  </div>
</template>

<script>
import screenTools from '../tools/screenTools';
import socketTools from '../tools/socketTools';
const { ipcRenderer } = require('electron');

export default {
  name: 'SharedScreen',
  data() {
    return {
    };
  },
  created() {
    ipcRenderer.on('REMOTE_SCREEN_STREAM', async (e, screenId) => {
      const stream = await screenTools.getStreamByScreenID(screenId); // 获取屏幕ScreenID
      console.log(stream);
      // document.querySelector('#localVideo').srcObject = stream;
      await this.createPeerConnection(stream);
    });
  },
  methods: {
    async createPeerConnection(stream) {
      socketTools.createPeerConnection(stream);
    },
  },
};
</script>

<style scoped>
.video {
  width: 100%;
  height: 100%;
}
</style>
