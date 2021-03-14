<template>
  <div id="BreathBtn"  @click.prevent="$emit('click')">
    <div id="inner" class="whiteBorder">
      <img alt="arrow" class="arrow" :src="rightArrow" />
    </div>
  </div>
</template>

<script>
import Logo from '../../../static/images/rightArrow.png';

export default {
  name: 'breathBtn',
  data() {
    return {
      rightArrow: Logo,
    };
  },
};
</script>

<style scoped>
#BreathBtn {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.whiteBorder{
  border: 2px solid #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.arrow {
  width: 70%;
  -webkit-user-drag: none;
}
#inner {
  opacity: 0.3;
}
#inner:hover {
  animation: OpacityBreath 1s ease-in-out;
  opacity: 1;
  cursor: pointer;
}
@keyframes OpacityBreath {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.65;
  }

  100% {
    opacity: 0.95;
  }
}
</style>
