// 渲染进程中使用
/**
 * 获取屏幕信息
 * @returns {Electron.Display[]}
 */
const { desktopCapturer } = require('electron');
const getAllStream = async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
  });
  return sources;
};

/*
const getDisplayMedia = () => {
  // getDisplayMedia 获取电脑屏幕的视频流，不过暂时无法获取音频媒体流，如果需要音频流，手动添加到轨道内，使之同步播放
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then((s) => {
      // 增加音频流
      navigator.mediaDevices.getMedia({ audio: true })
        .then((audioStream) => {
          [audioTrack] = audioStream.getAudioTracks();
          [videoTrack] = s.getVideoTracks();
          stream = new MediaStream([videoTrack, audioTrack]); // 音视频流
        })
        .catch((err) => { console.log(err); });
    })
    .catch((err) => { console.log(err); });
};
*/

const getStreamByScreenID = async (screenID) => {
  // getDisplayMedia 获取电脑屏幕的视频流，不过暂时无法获取音频媒体流，如果需要音频流，手动添加到轨道内，使之同步播放
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSourceId: screenID,
        chromeMediaSource: 'desktop',
        minFrameRate: 30,
        maxFrameRate: 60,
      },
    },
  });
  return stream;
};


export default {
  getAllStream,
  getStreamByScreenID,
};
