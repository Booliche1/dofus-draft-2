<template>
  <div id="app">
    <DraftModule />
  </div>
</template>

<script>
import DraftModule from './components/DraftModule.vue'

export default {
  name: 'App',
  components: {
    DraftModule
  }
}
</script>

<style>
/* Ajoutez ici les styles globaux si nécessaire */
body, html {
  font-family: 'Inter', Arial, sans-serif;
  background-color: #121212;
  color: #ffffff;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
