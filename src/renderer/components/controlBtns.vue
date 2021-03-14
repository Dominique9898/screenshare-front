<template>
  <div class="controlBtns">
    <div @click="Close" class="controlBtn red"></div>
    <div @click="ZoomOut" class="controlBtn orange"></div>
    <div class="controlBtn grey"></div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
  name: 'controlBtns',
  methods: {
    Close() {
      ipcRenderer.send('WINDOW::CLOSE');
    },
    ZoomOut() {
      ipcRenderer.send('WINDOW::ZOOMOUT');
    },
  },
};
</script>

<style scoped>
.controlBtns {
  background-color: black;
  opacity: 0.9;
  padding: 5px 10px;
  -webkit-app-region: drag;
  -webkit-user-select: none;
}
.controlBtn {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 50%;
  display: inline-block;
  background-color: #4e4f4f;
}
.red {
  background-color: red;
}
.orange {
  background-color: orange;
}
.grey {
  background-color: grey;
}
</style>
