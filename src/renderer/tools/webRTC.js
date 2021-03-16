const peers = {};
// eslint-disable-next-line no-unused-vars
const sdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [{
    VoiceActivityDetection: false,
  }],
};
const createPeerConnection = (userId) => {
  const configuration = {
    iceServers: [
      {
        urls: 'turn:121.4.130.218:3478',
        username: 'dominik',
        credential: '19989813wei.',
      },
    ],
    iceCandidatePoolSize: 2,
  };
  const pc = new RTCPeerConnection(configuration);
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      console.log('find a candidate', e.candidate);
    }
  };
  peers[userId] = pc;
  console.log(`${userId} 创建peerConnection`);
  return pc;
};
const createOffer = (peer) => {
  // 创建一个SDP offer
  peer.createOffer(sdpConstraints)
    .then((offer) => {
      console.log('创建Offer');
      peer.setLocalDescription(offer);
    }).catch((e) => {
      throw e;
    });
};
const closePeerConnection = (userId) => {
  peers[userId].close();
  delete peers[userId];
  console.log(`${userId} 关闭PeerConnection连接`);
};
export default {
  createPeerConnection,
  closePeerConnection,
  createOffer,
};
