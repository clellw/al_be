<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SceneNiveau1 } from '@/scenes/SceneNiveau1';

export default defineComponent({
  name: 'PaperClip',
  mounted(){
    const canvas = document.querySelector("canvas")!;
    new SceneNiveau1(canvas);
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
