<template>
  <div class="home">
    <control-btns></control-btns>
    <div class="container">
      <img class="partBlock" id="logoPic" :src="logoPath" alt="logo" />
      <div class="partBlock" id="topContainer">
        <div>Code</div>
        <input @focus="clearPlaceHold" @blur="recoverPlaceHold" id="codeInput" :placeholder="placeholderCode" />
      </div>
      <div @click="enterRemoteRoom" class="partBlock codeButton">开始投屏</div>
      <div
          class="partBlock"
          style="height: 1px; background:linear-gradient(244deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)"
      ></div>
      <div id="upperContainer">
        <div style="text-align: center">Select screen for share</div>
        <BreathBtn
            @click="toMultiScreen"
            style="position: relative;left: 50%;transform: translate(-50%);"
        ></BreathBtn>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '../../../static/images/logo.png';
import BreathBtn from '../components/breathBtn';
import ControlBtns from '../components/controlBtns';
import socketTools from '../tools/socketTools';

export default {
  name: 'landing-page',
  components: { ControlBtns, BreathBtn },
  data() {
    return {
      logoPath: Logo,
      placeholderCode: 'ABCDEFG',
    };
  },
  methods: {
    toMultiScreen() {
      this.$router.push('/multiScreen');
    },
    enterRemoteRoom() {
      const remoteCode = document.getElementById('codeInput').value;
      socketTools.enterRemoteRoom(remoteCode);
    },
    clearPlaceHold() {
      this.placeholderCode = '';
    },
    recoverPlaceHold() {
      this.placeholderCode = 'ABIDE';
    },
  },
};
</script>

<style>
.home {
  width: 400px;
  height: 600px;
  background-color: black;
  opacity: 0.9;
  color: white;
  position: relative;
  user-select: none;
  overflow: hidden;
}
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#upperContainer {
  height: 100px;
  user-select: none;
  -webkit-user-drag: none;
}
#logoPic {
  position: relative;
  left: 50%;
  transform: translate(-50%);
  -webkit-user-drag: none;
}
#codeInput {
  width: 250px;
  height: 40px;
  background-color: #231e31;
  outline: none;
  border: none;
  padding: 0 5px;
  font-size: 18px;
  color: #e1e1e6;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom: 1px solid #42b983;
}
.codeButton {
  width: 250px;
  height: 40px;
  padding: 0 5px;
  text-align: center;
  line-height: 40px;
  border: none;
  background-color: #42b983;
  font-size: 18px;
}
.codeButton::before {
  transition: all 0.8s;
  content: '';
  width: 1px;
  height: 40px;
  left: 0;
  background: linear-gradient(to left, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.4) 50%);
  position: absolute;
}
.codeButton:hover:before {
  background-position: left bottom;
  width: 200%;
}
.partBlock {
  margin: 20px 0;
}
</style>
