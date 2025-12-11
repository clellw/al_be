<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SceneLA } from '@/scenes/SceneLA';

export default defineComponent({
  name: 'PaperClip',
  mounted(){
    const canvas = document.querySelector("canvas")!;
    new SceneLA(canvas);
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

canvas {
  width: 70%;
  height: 70%;
}

</style>
