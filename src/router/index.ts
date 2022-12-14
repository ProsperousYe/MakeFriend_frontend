import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/index",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/IndexView.vue"),
      children: [
        {
          path: "/index",
          name: "index",
          component: () => import("@/components/HelloWorld.vue"),
        },
        {
          path: "session/:session_id",
          name: "session",
          component: () => import("@/components/SessionComponent/SessionComponent.vue"),
        },
        {
          path: "group/:group_id",
          name: "group",
          component: () => import("@/components/GroupComponent/GroupComponent.vue"),
        }
      ],
    },
    {
      path: "/admin",
      component: () => import("@/views/AdminView.vue"),
      children: [
        {
          path: "/all_users",
          name: "all_users",
          component: () => import("@/components/AdminComponent/AllUser.vue"),
        },
        {
          path: "/statistics",
          name: "statistics",
          component: () => import("@/components/AdminComponent/StatisticPage.vue"),
        },        {
          path: "/log",
          name: "log",
          component: () => import("@/components/AdminComponent/LogPage.vue"),
        }
      ]
    }
  ],
});

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
      next();
  } else {
      let token = localStorage.getItem('token');
      if (token === null || token === '') {
          next('/');
      } else {
          next();
      }
    }
  }
);

export default router;
