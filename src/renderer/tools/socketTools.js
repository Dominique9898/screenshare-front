const io = require('socket.io-client');
// const host = '121.4.130.218:3000';
const host = 'http://localhost:3000';
let socket = null;// 注册Socket监听
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const SCREEN_SEND_OFFER = 'screen-send-offer';
const USER_JOINED = 'user-joined';
const EXCHANGE_CANDIDATE = 'exchange-candidate';
const SCREEN_OFFER_TO_CLIENT = 'screen-offer-to-client';
const CLIENT_ANSWER_TO_SCREEN = 'client-answer-to-screen';

function createSocket() {
  if (!socket) {
    socket = io(host);
    socket.on(USER_JOINED, (user) => {
      console.log(`other user ${user.userId} joined`);
    });
  }
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

function screenSendOffer(remoteCode, offer) {
  socket.emit(SCREEN_SEND_OFFER, remoteCode, offer);
}
function clientSendAnswer(remoteCode, answer) {
  socket.emit(CLIENT_ANSWER_TO_SCREEN, remoteCode, answer);
}
function exchangeCandidate(e) {
  socket.emit(EXCHANGE_CANDIDATE, {
    iceCandidate: e.candidate,
  });
}

function findOffer(remoteCode) {
  return new Promise((resolve, reject) => {
    // Connect to socket.io server
    createSocket();

    // Send signal for find offer with code
    socket.emit(SCREEN_OFFER_TO_CLIENT, remoteCode, (offer) => {
      if (offer) {
        resolve(offer);
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Not found offer with code ${remoteCode}`);
      }
    });
  });
}

function bindScreenPeerWithSocket(peer) {
  socket.on(CLIENT_ANSWER_TO_SCREEN, async (data) => {
    console.log('client: 收到answer', data);
    await peer.setRemoteDescription(data);
  });
  socket.on(EXCHANGE_CANDIDATE, async (message) => {
    if (message.iceCandidate) {
      try {
        await peer.addIceCandidate(message.iceCandidate);
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    }
  });
}
export default {
  closeSocket,
  enterRemoteRoom,
  leaveRemoteRoom,
  screenSendOffer,
  exchangeCandidate,
  bindScreenPeerWithSocket,
  findOffer,
  clientSendAnswer,
};
