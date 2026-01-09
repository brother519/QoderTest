import { createRouter, createWebHistory } from 'vue-router'
import LogSearch from '../views/LogSearch.vue'
import RealTimeLogs from '../views/RealTimeLogs.vue'
import AlertRules from '../views/AlertRules.vue'

const routes = [
  {
    path: '/',
    redirect: '/search'
  },
  {
    path: '/search',
    name: 'LogSearch',
    component: LogSearch
  },
  {
    path: '/realtime',
    name: 'RealTimeLogs',
    component: RealTimeLogs
  },
  {
    path: '/alerts',
    name: 'AlertRules',
    component: AlertRules
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
