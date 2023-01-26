import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { activeSection0 } from '@/store/navLinks';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/maps/brazil-states',
    name: 'BrazilStates',
    component: () => import(/* webpackChunkName: "states-view" */ '../views/BrazilStatesView.vue')
  },
  {
    path: '/maps/brazil-municipalities',
    name: 'BrazilMunicipalities',
    component: () => import(/* webpackChunkName: "municipalities-view" */ '../views/BrazilMunicipalitiesView.vue')
  },
  {
    path: '/maps/render-brazil-map',
    name: 'RenderBrazilMap',
    component: () => import(/* webpackChunkName: "render-map-view" */ '../views/RenderBrazilMapView.vue')
  },
  {
    path: '/maps/geo-features',
    name: 'CityGeographicFeatures',
    component: () => import(/* webpackChunkName: "geo-features-view" */ '../views/CityGeographicFeaturesView.vue')
  },
  {
    path: '/maps/metropolitan-regions',
    name: 'MetropolitanRegions',
    component: () => import(/* webpackChunkName: "metropolitan-regions-view" */ '../views/MetropolitanRegionsView.vue')
  },
  {
    path: '/maps/funds',
    name: 'BrazilRealStateFunds',
    component: () => import(/* webpackChunkName: "real-state-view" */ '../views/BrazilRealStateFundsView.vue')
  },
  {
    path: '/maps/funds-density',
    name: 'BrazilRealStateDensity',
    component: () => import(/* webpackChunkName: "real-state-density-view" */ '../views/BrazilRealStateDensityView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.afterEach(() => {
  activeSection0.value = ''
})

export default router
