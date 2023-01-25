<template>
  <nav>
    <div class="app__header__level-0">
      <template v-for="(navLink, index) in groupedNavLinks" :key="index+'-0'">
        <router-link
          v-if="navLink.to"
          :to="navLink.to"
        >
          {{ navLink.text }}
        </router-link>
        <span
          v-else
          :class="activeSection0===navLink.key? 'app__pseudo-link-exact-active': 'app__pseudo-link'"
          :to="navLink.to"
          @click="handleClick(navLink.key)"
        >
          {{ navLink.text }}
        </span>
        {{isLastLink(index)? null: ' | '}}
      </template>
    </div>
    <hr>
    <template v-for="(navLink, index) in activeSectionLinks" :key="index+'-inner'">
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
import { activeSection0, activeSectionLinks, groupedNavLinks } from '@/store/navLinks';

const navLinks = [
  {
    text: 'Home',
    to: '/',
  },
  {
    text: 'Mapa PIB dos estados',
    to: '/maps/brazil-states',
  },
  {
    text: 'Mapa PIB municípios',
    to: '/maps/brazil-municipalities',
  },
  {
    text: 'Mapa características geográficas',
    to: '/maps/geo-features',
  }, 
  {
    text: 'Mapa regiões metropolitanas',
    to: '/maps/metropolitan-regions',
  },
  {
    text: 'Mapa FIIs',
    to: '/maps/funds',
  },
]

// functions
function isLastLink(index: number) {
  return (navLinks.length - 1) === index
}

function handleClick(key: string) {
  if(activeSection0.value === key) {
    activeSection0.value = ''
    return
  }
  activeSection0.value = key
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

nav a,
.app__pseudo-link {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active,
.app__pseudo-link-exact-active {
  font-weight: bold;
  color: #42b983;
}

.my-1 {
  margin-top: 6px;
  margin-bottom: 6px;
}

</style>
