import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import { auth } from '../plugins/firebase'

Vue.use(VueRouter)

const routes = [  
  {
    path: '/',
    name: 'Dashboard',
    redirect: '/home',
    component: () => import('@/components/Layout'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
      },
      {
        path: 'about',
        name: 'Sobre',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'perfil',
        name: 'Perfil',
        component: () => import(/* webpackChunkName: "perfil" */ '../views/Perfil.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const loginRoute = {
    path: '/login',
    query: { redirect: to.fullPath }
  }

  const requiresAuth = to.matched.some(item => item.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (to.path === '/login' && isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  if (requiresAuth && !isAuthenticated) {
    next(loginRoute)
  } else {
    next()
  }
})

export default router
