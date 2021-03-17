const { ipcRenderer } = require('electron');
const io = require('socket.io-client');
// const host = '121.4.130.218:3000';
const host = 'http://localhost:3000';
let socket = null;// 注册Socket监听
const DELETE_REMOTE_CODE = 'delete-remote-code';
const ENTER_REMOTE_ROOM = 'enter-remote-room';
const LEAVE_REMOTE_ROOM = 'leave-remote-room';
const SEND_OFFERSDP = 'send-offersdp';

function createSocket() {
  if (!socket) {
    socket = io(host);
    socket.on(DELETE_REMOTE_CODE, (userId) => {
      console.log(`${userId}断开连接`);
    });
    socket.on(ENTER_REMOTE_ROOM, (remoteId, remoteCode, receviedId) => {
      ipcRenderer.send('CLIENT_ENTER_REMOTE_ROOM', remoteCode, receviedId);
      console.log(`${receviedId} 加入 ${remoteId} 的房间`);
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


function sendToServer(remotedCode, desc) {
  socket.emit(SEND_OFFERSDP, remotedCode, desc);
}
export default {
  closeSocket,
  enterRemoteRoom,
  leaveRemoteRoom,
  sendToServer,
};
