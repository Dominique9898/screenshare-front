const io = require('socket.io-client');
const host = 'http://localhost:3000';
let socket = null;

// 注册Socket监听
const REGIST_REMOTE_CODE = 'regist-remote-code';
const DELETE_REMOTE_CODE = 'delete-remote-code';
const ENTER_REMOTE_ROOM = 'enter-remote-room';

function createSocket() {
  if (!socket) {
    socket = io(host);
  }
}
function closeSocket() {
  socket.close();
}
function registRemoteCode(code) {
  createSocket();
  socket.emit(REGIST_REMOTE_CODE, code, socket.id);
}
function enterRemoteRoom(code) {
  createSocket();
  socket.emit(ENTER_REMOTE_ROOM, code, socket.id);
}
function createPeerConnection(stream) {
  const peerConfig = {
    initiator: true,
    trickle: false,
    stream,
    config: {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // google的stun服务器
    },
  };
  const pc = new RTCPeerConnection(peerConfig);
  // 发送ICE候选到其他客户端
  pc.onicecandidate = (event) => {
    socket.send(JSON.stringify({
      event: '__ice_candidate',
      data: {
        candidate: event.candidate,
      },
    }));
  };
}
function disconnected(code) {
  createSocket();
  socket.emit(DELETE_REMOTE_CODE, code);
}
export default {
  registRemoteCode,
  closeSocket,
  enterRemoteRoom,
  disconnected,
  createPeerConnection,
};
