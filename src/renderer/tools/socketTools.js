import screenTools from './screenTools';
import rtctools from './webRTC';
// import screenTools from './screenTools';

const io = require('socket.io-client');
// const host = '121.4.130.218:3000';
const host = 'http://localhost:3000';
let socket = null;// 注册Socket监听
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const SCREEN_SEND_SCREEN_OFFER = 'screen-send-screen-offer';
const SCREEN_SEND_VIDEO_OFFER = 'screen-send-video-offer';
const CLIENT_SCREEN_ANSWER_TO_SCREEN = 'client-screen-answer-to-screen';
const CLIENT_VIDEO_ANSWER_TO_SCREEN = 'client-video-answer-to-screen';
const GET_SCREEN_ANSWER = 'get-screen-answer';
const GET_VIDEO_ANSWER = 'get-video-answer';
const GET_SCREEN_OFFER = 'get-screen-offer';
const GET_VIDEO_OFFER = 'get-video-offer';
const SCREEN_TO_CLIENT_SCREEN_CANDIDATE = 'screen-to-client-screen-candidate';
const SCREEN_TO_CLIENT_VIDEO_CANDIDATE = 'screen-to-client-video-candidate';
const CLIENT_TO_SCREEN_SCREEN_CANDIDATE = 'client-to-screen-screen-candidate';
const CLIENT_TO_SCREEN_VIDEO_CANDIDATE = 'client-to-screen-video-candidate';
const { ipcRenderer } = require('electron');
let screenSenderPeer = null;
let videoSenderPeer = null;
let screenClientPeer = null;
let videoClientPeer = null;
let localScreenStream = null;
let localVideoStream = null;
let remoteCode = null;
const sdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [{
    VoiceActivityDetection: false,
  }],
};
function createSocket() {
  if (!socket) {
    socket = io(host);
    socket.on(ENTER_REMOTE_ROOM, async () => {
      console.log('开始建立peerConnection');
      // 获取Stream,remoteCode
      // 建立peers
      screenSenderPeer = rtctools.createPeerConnection();
      videoSenderPeer = rtctools.createPeerConnection();
      localVideoStream = await screenTools.getVideoStream();
      screenSenderPeer.onconnectionstatechange = () => {
        console.log(
          'screenSenderPeer Connection State Change :',
          screenSenderPeer.connectionState,
        );
      };
      videoSenderPeer.onconnectionstatechange = () => {
        console.log(
          'videoSenderPeer Connection State Change :',
          videoSenderPeer.connectionState,
        );
      };
      screenSenderPeer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(SCREEN_TO_CLIENT_SCREEN_CANDIDATE, remoteCode, e.candidate);
        }
      };
      videoSenderPeer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(SCREEN_TO_CLIENT_VIDEO_CANDIDATE, remoteCode, e.candidate);
        }
      };
      // screenSenderPeer
      console.log('localScreenStream', localScreenStream);
      console.log('localVideoStream', localVideoStream);
      await screenSenderPeer.addStream(localScreenStream);
      await videoSenderPeer.addStream(localVideoStream);
      screenSenderPeer.onaddstream = ((e) => {
        console.log('screenSenderPeer', e);
      });
      videoSenderPeer.onaddstream = (e) => {
        console.log('videoSenderPeer', e);
      };
      // 创建offer
      screenSenderPeer.createOffer(sdpConstraints)
        .then(async (offer) => {
          await screenSenderPeer.setLocalDescription(offer);
          console.log('screen:create/send screen offer: ', offer);
          socket.emit(SCREEN_SEND_SCREEN_OFFER, remoteCode, offer); // 发送offer给server
        }).catch((e) => {
          throw e;
        });
      videoSenderPeer.createOffer(sdpConstraints)
        .then(async (offer) => {
          await videoSenderPeer.setLocalDescription(offer);
          console.log('screen:create/send video offer: ', offer);
          socket.emit(SCREEN_SEND_VIDEO_OFFER, remoteCode, offer); // 发送offer给server
        }).catch((e) => {
          throw e;
        });
    });
    socket.on(GET_SCREEN_OFFER, async (remoteCode, offer) => {
      // screenClientPeer收到offer
      console.log('client:get screen offer: ', offer);
      screenClientPeer = rtctools.createPeerConnection();
      screenClientPeer.onaddstream = (event) => {
        document.getElementById('remoteScreen').srcObject = event.stream;
        console.warn('client: screen onstream', document.getElementById('remoteScreen'));
        ipcRenderer.send('OPEN_SHAREWINDOW');
      };
      console.log('screenClientPeer', screenClientPeer);
      screenClientPeer.onconnectionstatechange = () => {
        console.log(
          'RTC Connection State Change :',
          screenClientPeer.connectionState,
        );
      };
      screenClientPeer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(CLIENT_TO_SCREEN_SCREEN_CANDIDATE, remoteCode, e.candidate);
        }
      };
      await screenClientPeer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await screenClientPeer.createAnswer();
      await screenClientPeer.setLocalDescription(answer);
      console.log('client:send answer: ', answer);
      socket.emit(CLIENT_SCREEN_ANSWER_TO_SCREEN, remoteCode, answer);
    });
    socket.on(GET_VIDEO_OFFER, async (remoteCode, offer) => {
      // screenClientPeer收到offer
      console.log('client:get video offer: ', offer);
      videoClientPeer = rtctools.createPeerConnection();
      const stream = await screenTools.getVideoStream();
      videoClientPeer.addStream(stream);
      videoClientPeer.onaddstream = (event) => {
        document.getElementById('remoteVideo').srcObject = event.stream;
        console.warn('client: onstream', document.getElementById('remoteVideo'));
        ipcRenderer.send('OPEN_SHAREWINDOW');
      };
      console.log('videoClientPeer', videoClientPeer);
      videoClientPeer.onconnectionstatechange = () => {
        console.log(
          'videoClientPeer Connection State Change :',
          videoClientPeer.connectionState,
        );
      };
      videoClientPeer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(CLIENT_TO_SCREEN_VIDEO_CANDIDATE, remoteCode, e.candidate);
        }
      };
      await videoClientPeer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await videoClientPeer.createAnswer();
      await videoClientPeer.setLocalDescription(answer);
      console.log('client:send video answer: ', answer);
      socket.emit(CLIENT_VIDEO_ANSWER_TO_SCREEN, remoteCode, answer);
    });
    socket.on(GET_SCREEN_ANSWER, async (remoteCode, answer) => {
      // screenSenderPeer
      console.log('screen:get answer:', answer);
      await screenSenderPeer.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on(GET_VIDEO_ANSWER, async (remoteCode, answer) => {
      // screenSenderPeer
      console.log('screen:get answer:', answer);
      await videoSenderPeer.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on(SCREEN_TO_CLIENT_SCREEN_CANDIDATE, async (remoteCode, candidate) => {
      if (candidate) {
        console.log('client: get screen ice:', remoteCode, candidate);
        await screenClientPeer.addIceCandidate(candidate);
      }
    });
    socket.on(SCREEN_TO_CLIENT_SCREEN_CANDIDATE, async (remoteCode, candidate) => {
      if (candidate) {
        console.log('client: get screen ice:', remoteCode, candidate);
        await videoClientPeer.addIceCandidate(candidate);
      }
    });
    socket.on(CLIENT_TO_SCREEN_SCREEN_CANDIDATE, async (remoteCode, candidate) => {
      if (candidate) {
        console.log('screen: get client screen ice:', candidate);
        await screenSenderPeer.addIceCandidate(candidate);
        await videoSenderPeer.addIceCandidate(candidate);
      }
    });
    socket.on(CLIENT_TO_SCREEN_VIDEO_CANDIDATE, async (remoteCode, candidate) => {
      if (candidate) {
        console.log('screen: get client video ice:', candidate);
        await videoSenderPeer.addIceCandidate(candidate);
      }
    });
  }
}
function setInfo(_localScreenStream, _remoteCode) {
  remoteCode = _remoteCode;
  localScreenStream = _localScreenStream;
}
function closeSocket(remoteCode) {
  if (socket) {
    socket.emit('leave', remoteCode);
    // socket.disconnect();
  }
}
function enterRemoteRoom(user) {
  // // 进入房间
  return new Promise((resolve) => {
    createSocket();
    socket.emit(ENTER_REMOTE_ROOM, user, (user) => {
      resolve(user); // 获取user信息
    });
  });
}
function leaveRemoteRoom(user) {
  return new Promise((resolve) => {
    createSocket();
    socket.emit(LEAVE_REMOTE_ROOM, user, (user) => {
      resolve(user); // 获取user信息
    }); // 离开房间
  });
}

export default {
  closeSocket,
  enterRemoteRoom,
  leaveRemoteRoom,
  setInfo,
};
