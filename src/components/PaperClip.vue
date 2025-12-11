<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FirstScene } from '@/scenes/FirstScene';

export default defineComponent({
  name: 'PaperClip',
  mounted(){
    const canvas = document.querySelector("canvas")!;
    new FirstScene(canvas);
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

canvas {
  width: 100%;
  height: 100%;
}

</style>
