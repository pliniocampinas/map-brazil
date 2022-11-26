import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
