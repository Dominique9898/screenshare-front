<template>
  <div class="sharedScreen">
<!--    <video id="localVideo" class="video" autoplay="autoplay"></video>-->
    <video id="remoteVideo" class="video" autoplay="autoplay"></video>
  </div>
</template>

<script>
import screenTools from '../tools/screenTools';
import socketTools from '../tools/socketTools';
import rtctools from '../tools/webRTC';
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
      await this.enterRemoteRoom(remoteCode);
      if (screenId) {
        this.stream = await this.getScreenMedia(screenId);
        console.log('stream', this.stream);
        this.createSreenPeerConnection(remoteCode);
      } else {
        await this.createClientConnection(remoteCode);
      }
    });
    ipcRenderer.on('LEAVE_REMOTE_ROOM', async () => {
      await this.leaveRemoteRoom();
    });
  },
  methods: {
    createSreenPeerConnection(remoteCode) {
      const sdpConstraints = {
        RTCRtpTransceiver: 1,
      };
      const pc = rtctools.createPeerConnection();
      pc.addStream(this.stream);
      pc.createOffer(sdpConstraints)
        .then((offer) => {
          pc.setLocalDescription(offer);
          console.log('offer', offer);
          socketTools.screenSendOffer(remoteCode, offer);
        }).catch((e) => {
          throw e;
        });
      // 注册事件监听器
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('onicecandidate', e);
          socketTools.exchangeCandidate(e);
        }
      };
      pc.onconnectionstatechange = () => {
        console.log(
          'RTC Connection State Change :',
          pc.connectionState,
        );
      };
      socketTools.bindScreenPeerWithSocket(pc);
    },
    async createClientConnection(remoteCode) {
      const offer = await socketTools.findOffer(remoteCode);
      const pc = rtctools.createPeerConnection();
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketTools.clientSendAnswer(remoteCode, answer);
      pc.onaddstream = (event) => {
        document.getElementById('remoteVideo').srcObject = event.stream;
        this.win.show();
      };
      // 注册事件监听器
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('onicecandidate', e);
          socketTools.exchangeCandidate(e);
        }
      };
      pc.onconnectionstatechange = () => {
        console.log(
          'RTC Connection State Change :',
          pc.connectionState,
        );
      };
    },
    getScreenMedia(screenId) {
      return screenTools.getStreamByScreenID(screenId);
    },
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
