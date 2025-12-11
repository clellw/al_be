<template>
  <PaperClip/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PaperClip from './components/PaperClip.vue';

export default defineComponent({
  name: 'App',
  components: {
    PaperClip
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
}
html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
