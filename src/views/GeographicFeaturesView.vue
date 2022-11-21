<template>
  <div class="geographic_features">
    <div class="geographic_features__container">
      
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import LoadingBars from '@/components/LoadingBars.vue';

export default defineComponent({
  name: 'GeographicFeaturesView',

  components: {
    LoadingBars,
  },

  setup() {
    const chartContainerElement = ref(null as HTMLElement | null)
    const isLoading = ref(false)

    onMounted(async () => {
    })

    return {
      isLoading,
      chartContainerElement,
    }
  }
});
</script>

<style>
.geographic_features {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.geographic_features__container {
  background-color: #f9f9f9;
}
</style>