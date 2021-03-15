const io = require('socket.io-client');
const host = '121.4.130.218:3000';
// const host = 'http://localhost:3000';
let socket = null;

// 注册Socket监听
const CREATE_REMOTE_CODE = 'create-remote-code';
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
function enterRemoteRoom(code) {
  createSocket();
  socket.emit(ENTER_REMOTE_ROOM, code, socket.id);
}
async function createRemoteCode() {
  createSocket();
  return new Promise((resolve) => {
    socket.emit(CREATE_REMOTE_CODE, (code) => {
      resolve(code);
    });
  });
}
function createPeerConnection(stream) {
  console.log(stream);
}
function disconnected(code) {
  createSocket();
  socket.emit(DELETE_REMOTE_CODE, code);
}
export default {
  closeSocket,
  enterRemoteRoom,
  disconnected,
  createPeerConnection,
  createRemoteCode,
};
