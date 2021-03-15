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

const getStreamByScreenID = async (screenID) => {
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
