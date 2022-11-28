<template>
  <div class="geo-features">
    <div class="geo-features__container">
      <BrazilMunicipalitiesMap
        class="geo-features__map"
        :selectedCityCode="selectedCity"
        @loaded="svgLoaded"
        @city-click="cityClick"
        @path-map-loaded="pathMapLoaded"
      >
      </BrazilMunicipalitiesMap>
      <div class="geo-features__labels">
        <div class="geo-features__label">
          <span class="geo-features__label__text">
          Clique em um dos labels para ver detalhes
          </span>
        </div>
        <div class="geo-features__label geo-features--hover"
          v-for="(feature, index) in displayedFeatures"
          :key="index"
          @click="showFeatureDetails(feature.key)"
        >
          <span class="geo-features__label__text geo-features--hover">
          {{feature.label}}
          </span>
          <span class="geo-features__label__box blink" :style="`background-color:${feature.color};`"></span>
        </div>
      </div>
    </div>
    <div class="geo-features-details__container">
      <h1 class="geo-features-details__heading">Detalhes {{ selectedFeatureLabel }}</h1>
      <template v-if="selectedFeatureLabel">
        <div class="geo-features-details__options">
          <div class="geo-features-details__option">PIB per Capita</div>
          <div class="geo-features-details__option">Crescimento PIB</div>
          <div class="geo-features-details__option">Crescimento Pop.</div>
        </div>
      </template>
      <div v-else class="geo-features-details__options">
        ---
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import BrazilMunicipalitiesMap from '@/components/BrazilMunicipalitiesMap.vue';
import { fetchData } from '@/services/GetCityGeographicFeaturesService';
import CityGeographicFeatures from '@/interfaces/CityGeographicFeatures';

export default defineComponent({
  name: 'CityGeographicFeaturesView',

  components: {
    BrazilMunicipalitiesMap,
  },

  setup() {
    const displayedFeatures = [
      {
        label: 'MATOPIBA',
        key: 'matopiba',
        color: 'rgb(180, 180, 180)',
      },
      {
        label: 'Amazônia Legal',
        key: 'legal-amazon',
        color: 'rgb(50, 172, 50)',
      },
      {
        label: 'Semi-árido',
        color: 'rgb(252, 172, 99)',
        key: 'semi-arid',
      },
      {
        label: 'Defrontante ao mar',
        key: 'sea-front',
        color: 'rgb(50, 50, 180)',
      },
      {
        label: 'Outros',
        key: 'others',
        color: 'rgb(0, 122, 97)',
      },
    ]
    const selectedCity = ref('')
    const selectedFeature = ref('')
    const isLoading = ref(false)
    const municipalitiesList = ref<CityGeographicFeatures[]>([])

    const loadData = async () => {
      isLoading.value = true
      try {
        const data = await fetchData()
        municipalitiesList.value = data
        isLoading.value = false
      } catch(err) {
        isLoading.value = false
      }
    }

    const getFeatureColor = (city: CityGeographicFeatures): string => {
      // TODO: Handle intersections with matopiba legal amazon and semiarid
      if(city.isSeaFront) {
        return 'rgb(50, 50, 180)'
      }

      if(city.isMatopiba) {
        return 'rgb(180, 180, 180)'
      }

      if(city.isSemiArid) {
        return 'rgb(252, 172, 99)'
      }

      if(city.isLegalAmazon) {
        return 'rgb(50, 172, 50)'
      }

      return 'rgb(0, 122, 97)';
    }
    
    const colorizePaths = (pathElementsMap: { [code: string] : Element | null; }) => {
      municipalitiesList.value.forEach(d => {
        const pathElement = pathElementsMap[d.cityId]
        if(pathElement) {
          pathElement.setAttribute("fill", getFeatureColor(d))
        }
      })
    }

    const showFeatureDetails = (key: string) => {
      console.log('key', key)
      if(selectedFeature.value === key) {
        selectedFeature.value = ''
        return
      }
      selectedFeature.value = key
      // Scroll
      // Load
      // Render
    }

    const selectedFeatureLabel = computed(() => {
      return displayedFeatures.find(f => f.key===selectedFeature.value)?.label??''
    })

    return {
      displayedFeatures,
      selectedCity,
      selectedFeature,
      selectedFeatureLabel,
      svgLoaded: () => console.log('svgLoaded'),
      svgLoadError: () => console.log('svgLoadError'),
      cityClick: (code: string) => {
        if(selectedCity.value == code) {
          selectedCity.value = ''
          return
        }
        selectedCity.value = code;
      },
      pathMapLoaded: (pathMap: { [code: string] : Element | null; }) => {
        loadData().then(() => colorizePaths(pathMap))
      },
      showFeatureDetails,
    }
  }
});
</script>

<style>
.geo-features {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 750px;
  margin: auto;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: relative;
}

.geo-features__container {
  background-color: #e0e0f0;
  padding: 14px 10px;
}

.geo-features__labels {
  background-color: transparent;
  box-sizing: border-box;
  position: absolute;
  right: 0;
  top: 0;
  width: 180px;
  padding: 20px 10px 2px 2px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.geo-features__label {
  font-weight: 700;
  font-size: small;
  display: flex;
  align-items: center;
  align-self: end;
  gap: 8px;
  background-color: #e0e0f0;
  cursor: pointer;
}

.geo-features__label:hover .geo-features--hover,
.geo-features__label:hover .geo-features--hover {
  opacity: 0.6 !important;
}

.geo-features__label__box {
  border: 1px solid black;
  width: 15px;
  height: 15px;
  display: inline-block;
}

.blink {
  animation: blinker 6s linear infinite;
}

@keyframes blinker {
  0% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  95% {
    opacity: 0.4;
  }
}

.geo-features__map {
  height: 500px;
}

.geo-features-details__options {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.geo-features-details__option {
  border: 1px solid black;
  padding: 4px;
}
</style>