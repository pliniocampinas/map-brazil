<template>
  <div class="asset-browser">
    <div class="asset-browser__asset"
      v-for="(asset, index) in assets"
      :key="index"
    >
      <h4 class="asset-browser__heading">
        {{ asset.fundAcronym + ' - ' + asset.title }}
      </h4>
      <p class="asset-browser__paragraph">
        - <strong>City:</strong> {{ asset.city }} - {{ asset.stateAcronym }}
      </p>
      <p class="asset-browser__paragraph">
        - <strong>Metros²:</strong> {{ asset.squareMeters.toLocaleString('pt-br') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Asset from "@/interfaces/Asset";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'AssetBrowser',

  props: {
    assets: {
      type: Array as PropType<Array<Asset>>,
      default: () => []
    },
  },
});
</script>

<style scoped>
.asset-browser {
  padding: 8px;
  border: 1px solid #ddd;
  overflow: scroll;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

.asset-browser__asset {
  padding: 4px 8px;
  border: 1px solid #ddd;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  background-color: rgba(200, 200, 200, 0.3);
}

.asset-browser__heading {
  margin: 4px 0px;
  text-align: justify;
}

.asset-browser__paragraph {
  margin: 4px 0px;
  margin-left: 8px;
  text-align: justify;
}
</style>