<template>
  <div class="multiScreen">
    <img @click="returnHome" :src="leftarrow" alt="return" />
    <div class="container">
      <img class="partBlock" id="logoPic" :src="logoPath" alt="logo" />
      <div class="partBlock topContainer">
        <div id="codeDisplay">{{ Code }}</div>
        <div class="partBlock codeButton">生成投屏码</div>
      </div>
    </div>
  </div>
</template>

<script>
import arrow from '../../../static/images/leftArrow.png';
import Logo from '../../../static/images/logo.png';
import ScreenTools from '../tools/screenTools';
export default {
  name: 'multiScreen',
  beforeCreate() {
    ScreenTools.getPrimaryDisplay();
  },
  mounted() {

  },
  data() {
    return {
      Code: '******',
      leftarrow: arrow,
      logoPath: Logo,
    };
  },
  methods: {
    returnHome() {
      this.$router.push('/');
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
}
</style>
