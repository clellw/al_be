<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CH1_CU_OW_1 } from '@/scenes/chapterone/CH1_CU_OW_1';

export default defineComponent({
  name: 'PaperClip',
  mounted(){
    const canvas = document.querySelector("canvas")!;
    new CH1_CU_OW_1(canvas);
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

</style>
