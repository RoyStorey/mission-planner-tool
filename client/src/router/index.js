import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: () => import("../views/HomePage.vue"),
    meta: {
      title: "Home",
    },
  },
];

const router = createRouter({
  history: createWebHistory(
    process.env.NODE_ENV === "development" ? "./" : "/mpt"
  ),
  routes,
});

router.afterEach((to) => {
  document.title = `89th CS MPT | ${to.meta.title}`;
});

export default router;
