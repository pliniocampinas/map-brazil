<template>
  <div class="asset-browser">
    <div class="asset-browser__header">
      <h4 class="asset-browser__header__title">Fundos</h4>
      <ArrowButton
        :disabled="buttonDisabled"
        :direction="isOpen? 'up': 'down'"
        @click="oepnButtonClick"
      />
    </div>
    <div class="asset-browser__assets" :class="isOpen? 'asset-browser__assets--expanded':''">
      <div class="asset-browser__asset"
      v-for="(asset, index) in assets"
      :key="index"
      >
        <h4 class="asset-browser__asset__heading">
          {{ asset.fundAcronym + ' - ' + asset.title }}
        </h4>
        <p class="asset-browser__asset__paragraph">
          - <strong>City:</strong> {{ asset.city }} - {{ asset.stateAcronym }}
        </p>
        <p class="asset-browser__asset__paragraph">
          - <strong>Metros²:</strong> {{ asset.squareMeters.toLocaleString('pt-br') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Asset from "@/interfaces/Asset";
import ArrowButton from '@/components/ArrowButton.vue';
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'AssetBrowser',

  components: {
    ArrowButton,
  },

  props: {
    assets: {
      type: Array as PropType<Array<Asset>>,
      default: () => []
    },
    isOpen: {
      type: Boolean,
      default: false
    },
  },

  setup(props, { emit }) {
    return {
      buttonDisabled: computed(() => {
        if(!props.assets || props.assets.length === 0) {
          return true
        }
        return false
      }),
      oepnButtonClick: () => {
        if(!props.assets || props.assets.length === 0) {
          return
        }
        emit('open')
      }
    }
  }
});
</script>

<style scoped>
.asset-browser {
  padding: 8px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

.asset-browser__header {
  display: flex;
  align-items: center;
  justify-content:space-between;
}

.asset-browser__header__title {
  margin: 8px 0px;
  color: var(--app-tertiary-color);
}

.asset-browser__assets {
  flex-direction: column;
  max-height: 0px;
  row-gap: 8px;
  overflow: hidden;
  transition: max-height .4s ease-in-out;
}

.asset-browser__assets--expanded {
  max-height: 450px;
  display: flex;
  overflow: scroll;
  transition: all 0.45s ease-out;
}

.asset-browser__asset {
  padding: 4px 8px;
  border: 1px solid #ddd;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  background-color: var(--app-tertiary-color);
}

.asset-browser__asset-heading {
  margin: 4px 0px;
  text-align: justify;
}

.asset-browser__asset__paragraph {
  margin: 4px 0px;
  margin-left: 8px;
  text-align: justify;
}
</style>