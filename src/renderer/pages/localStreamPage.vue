<template>
    <div class="remoteRoom">
        <div id="title"></div>
        <!-- <video id="localVideo" autoplay="autoplay"></video> -->
        <video  style="display:none" id="RemoteVideo" autoplay="autoplay"></video>
        <div id="warning">
          <div><img :src="userLogo" /></div>
          <div>等待对方加入....</div>
        </div>
        <div id="finished">
          <img :src="logo" style="width:100%;height:100%"/>
        </div>
    </div>
</template>

<script>
import screenTools from '../tools/screenTools';
import socketTools from '../tools/socketTools';
import finishLogo from '../../../static/images/finished.png';
import _userLogo from '../../../static/images/user.png';
const { ipcRenderer } = require('electron');
export default {
  created() {
    localStorage.removeItem('user');
    ipcRenderer.on('CREATE_REMOTE_ROOM', async (e, params) => {
      const { screenId, remoteCode } = params;
      const localScreenStream = await screenTools.getStreamByScreenID(screenId);
      const localVideoStream = await screenTools.getVideoStream();
      console.log('localVideoStream');
      // const localVideo = document.getElementById('localVideo');
      // localVideo.srcObject = localVideoStream;
      socketTools.setInfo(localScreenStream, localVideoStream, remoteCode);
      await this.enterRemoteRoom(remoteCode);
    });
  },
  methods: {
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
  data() {
    return {
      isShowRemoteVideo: false,
      logo: finishLogo,
      userLogo: _userLogo,
    };
  },
};
</script>

<style>
.remoteRoom {
  overflow: hidden;
  width: 100%;
  height: 100vh;
  position: relative;
}
video{
  border: 0;
  vertical-align: bottom;
  width: 100%;
  height: 100%;
}
#title{
  width: 232px;
  height: 35px;
  -webkit-app-region: drag;
  background-color: #515151
}
#localVideo {
  width: 232px;
  height: 130px;
}
#RemoteVideo {
  width: 232px;
  height: 130px;
}
#warning {
  width: 232px;
  height: 130px;
  text-align: center;
}
#finished {
  position: absolute;
  width: 32px;
  height: 32px;
  left: 50%;
  bottom: 5px;
  transform: translate(-50%);
}
</style>