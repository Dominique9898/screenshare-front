import rtctools from './webRTC';
// import screenTools from './screenTools';

const io = require('socket.io-client');
const host = '121.4.130.218:3000';
// const host = 'http://localhost:3000';
let socket = null;// 注册Socket监听
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const SCREEN_SEND_OFFER = 'screen-send-offer';
const CLIENT_ANSWER_TO_SCREEN = 'client-answer-to-screen';
const GET_ANSWER = 'get-answer';
const GET_OFFER = 'get-offer';
const SCREEN_TO_CLIENT_CANDIDATE = 'screen-to-client-candidate';
const CLIENT_TO_SCREEN_CANDIDATE = 'client-to-screen-candidate';
const { ipcRenderer } = require('electron');
let peerScreen = null;
let peerClient = null;
let stream = null;
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
      peerScreen = rtctools.createPeerConnection();
      peerScreen.onconnectionstatechange = () => {
        console.log(
          'RTC Connection State Change :',
          peerScreen.connectionState,
        );
      };
      peerScreen.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(SCREEN_TO_CLIENT_CANDIDATE, remoteCode, e.candidate);
        }
      };
      // peerScreen增加Stream
      await peerScreen.addStream(stream);
      peerScreen.onaddstream = ((e) => {
        console.log('peerScreen', e);
      });
      // 创建offer
      peerScreen.createOffer(sdpConstraints)
        .then(async (offer) => {
          await peerScreen.setLocalDescription(offer);
          console.log('screen:create/send offer: ', offer);
          socket.emit(SCREEN_SEND_OFFER, remoteCode, offer); // 发送offer给server
        }).catch((e) => {
          throw e;
        });
    });
    socket.on(GET_OFFER, async (remoteCode, offer) => {
      // peerClient收到offer
      console.log('client:get offer: ', offer);
      peerClient = rtctools.createPeerConnection();
      peerClient.onaddstream = (event) => {
        document.getElementById('remoteVideo').srcObject = event.stream;
        console.warn('client: onstream', document.getElementById('remoteVideo'));
        ipcRenderer.send('OPEN_SHAREWINDOW');
      };
      console.log('peerClient', peerClient);
      peerClient.onconnectionstatechange = () => {
        console.log(
          'RTC Connection State Change :',
          peerClient.connectionState,
        );
      };
      peerClient.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(CLIENT_TO_SCREEN_CANDIDATE, remoteCode, e.candidate);
        }
      };
      await peerClient.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerClient.createAnswer();
      await peerClient.setLocalDescription(answer);
      console.log('client:send answer: ', answer);
      socket.emit(CLIENT_ANSWER_TO_SCREEN, remoteCode, answer);
    });
    socket.on(GET_ANSWER, async (remoteCode, answer) => {
      // peerScreen收到answer
      console.log('screen:get answer:', answer);
      await peerScreen.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on(SCREEN_TO_CLIENT_CANDIDATE, async (remoteCode, candidate) => {
      if (candidate) {
        console.log('client: get screen ice:', remoteCode, candidate);
        await peerClient.addIceCandidate(candidate);
      }
    });
    socket.on(CLIENT_TO_SCREEN_CANDIDATE, async (remoteCode, candidate) => {
      console.log('screen: get client ice:', candidate);
      await peerScreen.addIceCandidate(candidate);
    });
  }
}
function setInfo(params) {
  // eslint-disable-next-line prefer-destructuring
  remoteCode = params.remoteCode;
  // eslint-disable-next-line prefer-destructuring
  stream = params.stream;
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
