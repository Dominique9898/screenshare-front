// 渲染进程中使用
let primaryDisplay;
let displays;
/**
 * 获取屏幕信息
 * @returns {Electron.Display[]}
 */
const { remote } = require('electron');

const getAllDisplays = () => {
  if (!displays) {
    displays = remote.screen.getAllDisplays();
    console.log('Displays', displays);
  }
  return displays;
};

/**
 *
 * @returns {Electron.Display}
 */
const getPrimaryDisplay = () => {
  if (!primaryDisplay) {
    primaryDisplay = remote.screen.getPrimaryDisplay();
    console.log('primaryDisplay', primaryDisplay);
  }
  return primaryDisplay;
};
export default {
  getAllDisplays,
  getPrimaryDisplay,
};
