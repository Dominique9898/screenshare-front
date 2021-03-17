import socketTools from './socketTools';

const sdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [{
    VoiceActivityDetection: false,
  }],
};
const createPeerConnection = () => {
  const configuration = {
    iceServers: [
      {
        urls: 'stun:121.4.130.218:3478',
        username: 'dominik',
        credential: '19989813wei.',
      },
      {
        urls: 'turn:121.4.130.218:3478',
        username: 'dominik',
        credential: '19989813wei.',
      },
    ],
    iceCandidatePoolSize: 2,
  };
  return new RTCPeerConnection(configuration);
};
const createOffer = (peer) => {
  // 创建一个SDP offer
  peer.createOffer(sdpConstraints)
    .then(async (offer) => {
      console.log(offer);
      await peer.setLocalDescription(offer);
      socketTools.screenSendOffer(offer);
    }).catch((e) => {
      throw e;
    });
};
const closePeerConnection = (peer) => {
  peer.close();
};
export default {
  createPeerConnection,
  closePeerConnection,
  createOffer,
};
