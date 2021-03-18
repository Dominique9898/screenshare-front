<template>
  <div class="sharedScreen">
<!--    <video id="localVideo" class="video" autoplay="autoplay"></video>-->
    <video id="remoteVideo" class="video" autoplay="autoplay"></video>
  </div>
</template>

<script>
import screenTools from '../tools/screenTools';
import socketTools from '../tools/socketTools';
const { ipcRenderer, remote } = require('electron');

export default {
  name: 'SharedScreen',
  data() {
    return {
      stream: [],
      peer: {},
      win: remote.getCurrentWindow(),
    };
  },
  created() {
    localStorage.removeItem('user');
    ipcRenderer.on('ENTER_REMOTE_ROOM', async (e, params) => {
      const { screenId, remoteCode } = params;
      if (screenId) {
        const stream = await screenTools.getStreamByScreenID(screenId);
        socketTools.setInfo({
          stream,
          remoteCode,
        });
      }
      await this.enterRemoteRoom(remoteCode);
    });
    ipcRenderer.on('LEAVE_REMOTE_ROOM', async () => {
      await this.leaveRemoteRoom();
    });
  },
  methods: {
    async leaveRemoteRoom() {
      let user = localStorage.getItem('user');
      user = JSON.parse(user);
      console.log(`client: ${user.userId} leaved, Room: ${user.remoteCode}`);
      user = await socketTools.leaveRemoteRoom(user);
      localStorage.setItem('user', JSON.stringify(user));
    },
    async enterRemoteRoom(remoteCode) {
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
