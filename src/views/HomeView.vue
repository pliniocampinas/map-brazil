<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <ul class="home-links__list">
      <template v-for="(link, index) in groupedNavLinks" :key="index+'-0'">
        <li class="home-links__item" v-if="index > 0">
          {{link.text}}
        </li>
        
        <router-link
          v-for="(innerLink, innerIndex) in link.inner" :key="index+'-0-'+innerIndex"
          :to="innerLink.to"
          custom
          v-slot="{ href, navigate }"
        >
          <li class="home-links__inner-item" @click="navigate">
            <a class="home-links__inner-item-anchor" :href="href">
              {{ innerLink.text }}
            </a>
          </li>
        </router-link>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { groupedNavLinks } from '@/store/navLinks';

export default defineComponent({
  name: 'HomeView',
  setup() {
    return {
      groupedNavLinks
    }
  }
});
</script>

<style>
.home-links__list {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-links__item,
.home-links__inner-item {
  border: 2px solid var(--app-secondary-color);
  list-style-type: none; /* Remove bullets */
  margin: 0; /* Remove margins */
  font-weight: bold;
}

.home-links__item {
  padding: 12px;
  font-size: 20px;
  background-color: var(--app-tertiary-color);
  color: var(--app-primary-color);
}

.home-links__inner-item {
  padding: 12px;
  background-color: var(--app-primary-color);
  color: var(--app-tertiary-color);
}

.home-links__inner-item-anchor {
  color: var(--app-tertiary-color);
}
</style>