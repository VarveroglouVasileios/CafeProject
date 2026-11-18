import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  // Hash history: deep links and reloads work on GitHub Pages without server fallbacks.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/menu', name: 'menu', component: () => import('./views/MenuView.vue') },
    { path: '/pickup', name: 'pickup', component: () => import('./views/PickupView.vue') },
    { path: '/ticket/:ref', name: 'ticket', component: () => import('./views/TicketView.vue') },
    { path: '/kitchen', name: 'kitchen', component: () => import('./views/KitchenView.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('./views/PrivacyView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
