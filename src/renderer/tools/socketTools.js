const io = require('socket.io-client');
// const host = '121.4.130.218:3000';
const host = 'http://localhost:3000';
let socket = null;

// 注册Socket监听
const CREATE_REMOTE_CODE = 'create-remote-code';
// const CREATE_REMOTE_CODE_TEST = 'create-remote-code-test';
const DELETE_REMOTE_CODE = 'delete-remote-code';
const ENTER_REMOTE_ROOM = 'enter-remote-room';
// const SEND_OFFER = 'send-offer';

function createSocket() {
  if (!socket) {
    socket = io(host);
  }
}
function closeSocket() {
  socket.close();
}
function enterRemoteRoom(remoteCode, userID) {
  createSocket();
  // socket.emit(CREATE_REMOTE_CODE_TEST); // 测试使用,虚拟建立投屏码
  socket.emit(ENTER_REMOTE_ROOM, remoteCode, userID); // 进入房间
}
async function createRemoteCode(userId) {
  return new Promise((resolve) => {
    createSocket();
    socket.emit(CREATE_REMOTE_CODE, userId, (code) => {
      resolve(code);
    });
  });
}
async function createPeerConnection(stream) {
  // Connect to socket.io server
  createSocket();
  // const configuration = {
  //   iceServers: [
  //     {
  //       urls: 'turn:121.4.130.218:3478',
  //       username: 'dominik',
  //       credential: '19989813wei.',
  //     },
  //     { url: 'stun:stun.l.google.com:19302' }, // 谷歌的公共服务
  //   ],
  //   iceCandidatePoolSize: 2,
  // };
  if (stream) {
    // 初始化屏幕端peerConnection
  }
}

function disconnected(code) {
  createSocket();
  socket.emit(DELETE_REMOTE_CODE, code);
}
export default {
  closeSocket,
  enterRemoteRoom,
  disconnected,
  createRemoteCode,
  createPeerConnection,
};
