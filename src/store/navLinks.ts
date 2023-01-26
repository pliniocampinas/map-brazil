import { computed, ref } from "vue"

export const groupedNavLinks = [
  {
    key: 'home',
    text: 'Home',
    to: '/',
  },
  {
    key: 'geo-features-views',
    text: 'Características Geográficas',
    inner: [
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
    ]
  },
  {
    key: 'funds-views',
    text: 'Fundos(FIIs)',
    inner: [
      {
        text: 'Mapa FIIs Estados',
        to: '/maps/funds',
      },
      {
        text: 'Mapa Densidade FIIs',
        to: '/maps/funds-density',
      },
    ]
  },
]

export const activeSection0 = ref('')
export const activeSectionLinks = computed(() => {
  return groupedNavLinks.find(section => section.key === activeSection0.value)?.inner?? []
})