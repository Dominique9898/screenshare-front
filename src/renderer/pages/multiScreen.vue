<template>
  <div class="multiScreen">
    <img v-if="!this.Code" @click="returnHome" :src="leftarrow" alt="return" />
    <div class="container">
      <div content="partBlock topCantainer">
        <div v-if="!this.Code">
          <div
              class="partBlock"
              style="height: 1px; background:linear-gradient(244deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)"
          ></div>
          <img
               :class="{active: index === isActivate}"
               style="width: 100%;margin: 10px 0"
               v-for="(stream, index) in streams"
               :src="stream.thumbnail.toDataURL()"
               :key="stream.id"
               @click="selectedScreen(index, stream.id)"
               alt="logo" />
          <div
              class="partBlock"
              style="height: 1px; background:linear-gradient(244deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)"
          ></div>
        </div>
        <div v-else>
          <img class="partBlock" id="logoPic" :src="logoPath" alt="logo" />
        </div>
      </div>
      <div class="partBlock upperContainer">
        <div v-if="this.Code" id="codeDisplay">{{ Code }}</div>
        <div v-if="!this.Code" @click="getRemoteScreenCode" class="partBlock codeButton">生成投屏码</div>
        <div v-if="this.Code" @click="disconnected" class="partBlock" id="disconnected">disconnected</div>
      </div>
    </div>
  </div>
</template>

<script>
import arrow from '../../../static/images/leftArrow.png';
import Logo from '../../../static/images/logo.png';
import screenTools from '../tools/screenTools';
const randomize = require('randomatic');
const { ipcRenderer } = require('electron');
export default {
  name: 'multiScreen',
  async created() {
    this.streams = await screenTools.getAllStream(); // 1. 获取屏幕信息, 默认先投主屏幕
  },
  data() {
    return {
      Code: '',
      isActivate: -1,
      leftarrow: arrow,
      logoPath: Logo,
      selectedScreenId: '',
      streams: [],
      userId: '',
    };
  },
  methods: {
    returnHome() {
      this.$router.push('/');
    },
    disconnected() {
      // 删除投屏房间号
      ipcRenderer.send('LEAVE_REMOTE_ROOM');
      this.returnHome();
    },
    selectedScreen(index, id) {
      this.isActivate = index;
      this.selectedScreenId = id;
    },
    async getRemoteScreenCode() {
      if (this.isActivate === -1) return;
      this.Code = randomize('A0', 6);
      ipcRenderer.send('CREATE_REMOTE_ROOM', {
        remoteCode: this.Code,
        screenId: this.selectedScreenId,
      });
    },
  },
};
</script>

<style scoped>
.multiScreen {
  width: 400px;
  height: 600px;
  background-color: black;
  opacity: 0.9;
  color: white;
  position: relative;
  user-select: none;
  overflow: hidden;
}
#codeDisplay {
  width: 250px;
  height: 40px;
  background-color: #231e31;
  border: none;
  padding: 0 5px;
  font-size: 20px;
  color: #e1e1e6;
  border-radius: 4px;
  text-align: center;
  line-height: 40px;
  user-select: text;
}
#disconnected {
  height: 10px;
  text-align: center;
  line-height: 10px;
  cursor: pointer;
}
#disconnected:hover {
  text-decoration: underline;
}
.active {
  border: 2px solid #42b983;
}
</style>
