<template>
  <nav>
    <template v-for="(navLink, index) in navLinks" :key="index">
      <router-link 
        :to="navLink.to"
      >
        {{ navLink.text }}
      </router-link>
      {{isLastLink(index)? null: ' | '}}
    </template>
  </nav>
  <router-view/>
</template>

<script setup lang="ts">

const navLinks = [
  {
    text: 'Home',
    to: '/',
  },
  {
    text: 'States Map',
    to: '/maps/brazil-states',
  },
  {
    text: 'Municipalities Map',
    to: '/maps/brazil-municipalities',
  },
  {
    text: 'Municipalities BoxPlot',
    to: '/plots/brazil-municipalities-boxplot',
  },
]

// functions
function isLastLink(index: number) {
  return (navLinks.length - 1) === index
}
</script>

<style>
:root {
  --app-primary-color: #2c3e50;
  --app-secondary-color: #42b983;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}


</style>
