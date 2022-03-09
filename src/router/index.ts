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
    path: '/plots/brazil-municipalities-boxplot',
    name: 'BrazilMunicipalities',
    component: () => import(/* webpackChunkName: "boxplot-municipalities-view" */ '../views/BrazilMunicipalitiesBoxPlotView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
