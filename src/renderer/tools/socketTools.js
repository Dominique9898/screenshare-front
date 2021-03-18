import rtctools from './webRTC';
// import screenTools from './screenTools';

const io = require('socket.io-client');
// const host = '121.4.130.218:3000';
const host = 'http://localhost:3000';
let socket = null;// 注册Socket监听
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const SCREEN_SEND_OFFER = 'screen-send-offer';
const CLIENT_ANSWER_TO_SCREEN = 'client-answer-to-screen';
const GET_ANSWER = 'get-answer';
const GET_OFFER = 'get-offer';

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
      // peerScreen增加Stream
      await peerScreen.addStream(stream);
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
      await peerClient.setRemoteDescription(offer);
      const answer = await peerClient.createAnswer();
      await peerClient.setLocalDescription(answer);
      console.log('client:send answer: ', answer);
      socket.emit(CLIENT_ANSWER_TO_SCREEN, remoteCode, answer);
    });
    socket.on(GET_ANSWER, async (answer) => {
      // peerScreen收到answer
      console.log('screen:get answer:', answer);
      console.log('screen: peer', peerScreen);
      await peerScreen.setRemoteDescription(answer);
      peerScreen.onicecandidate = (e) => {
        console.log('screen: ice: ', e);
      };
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
// function createSreenPeerConnection() {
//   peerScreen = rtctools.createPeerConnection();
// }
// function createClientConnection() {
//   peerClient = rtctools.createPeerConnection();
// }
export default {
  closeSocket,
  enterRemoteRoom,
  leaveRemoteRoom,
  setInfo,
  // createSreenPeerConnection,
  // createClientConnection,
};
