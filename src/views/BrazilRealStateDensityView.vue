<template>
  <div class="brazil-real-state-density">    
    <MapBrowser :isLoading="isLoading">
      <template v-slot:map-svg>
        <div class="brazil-real-state-density__map-container">
          <div class="placeholder" style="height: 300px;"></div>
        </div>
      </template>

      <template v-slot:browser-options>
        
      </template>

      <template v-slot:browser-details>
      </template>
    </MapBrowser>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fetchData as fetchAssets } from '@/services/GetAssetsService';
import { sleep } from '@/utils/timeHelper';
import MapBrowser from '@/components/MapBrowser.vue';
import Asset from '@/interfaces/Asset';


export default defineComponent({
  name: 'BrazilRealStateDensityView',

  components: {
    MapBrowser,
  },

  setup() {
    const isLoading = ref(false)
    const assets = ref([] as Asset[])
    const pathElementsMap = ref<{ [code: string] : Element | null;}>({})

    const statesSvgLoaded = async (pathMap: { [code: string] : Element | null; }) => {
      isLoading.value = true
      pathElementsMap.value = pathMap
      await sleep(400)
      assets.value = await fetchAssets()
      colorizeMap()
      isLoading.value = false
    }

    const colorizeMap = () => {
      console.log('colorizeMap')
    }

    return {
      assets,
      isLoading,
      statesSvgLoaded,
    }
  }
});
</script>

<style scoped>
.brazil-real-state-density__map-container {
  position: relative;
}
</style>
