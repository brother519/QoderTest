import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/product',
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/pages/product/index.vue'),
    meta: { title: '商品管理' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
