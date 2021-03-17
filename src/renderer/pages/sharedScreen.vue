<template>
  <div class="sharedScreen">
<!--    <video id="localVideo" class="video" autoplay="autoplay"></video>-->
    <video id="remoteVideo" class="video" autoplay="autoplay"></video>
  </div>
</template>

<script>
// import screenTools from '../tools/screenTools';
import socketTools from '../tools/socketTools';
const { ipcRenderer } = require('electron');

export default {
  name: 'SharedScreen',
  data() {
    return {
    };
  },
  created() {
    localStorage.removeItem('user');
    ipcRenderer.on('ENTER_REMOTE_ROOM', async (e, remoteCode) => {
      let user = JSON.parse(localStorage.getItem('user')) || {};
      if (user && user.status === 'connected') {
        console.log(`client: ${user.userId} repeat connected`);
        return;
      } else if (user && user.status === 'disconnected') {
        user.remoteCode = remoteCode;
        user = await socketTools.enterRemoteRoom(user);
        console.log(`client: ${user.userId} has connected again,room:${user.remoteCode}`);
      } else {
        user = await socketTools.enterRemoteRoom({
          remoteCode,
          userId: '',
        });
        console.log(`client: ${user.userId} joined room:${user.remoteCode}`);
      }
      localStorage.setItem('user', JSON.stringify(user));
    });
    ipcRenderer.on('LEAVE_REMOTE_ROOM', async () => {
      let user = localStorage.getItem('user');
      user = JSON.parse(user);
      console.log(`client: ${user.userId} leaved, Room: ${user.remoteCode}`);
      user = await socketTools.leaveRemoteRoom(user);
      localStorage.setItem('user', JSON.stringify(user));
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
