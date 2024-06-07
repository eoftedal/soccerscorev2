import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import MatchView from "@/views/MatchView.vue";
import MatchEdit from "@/views/MatchEdit.vue";
import MatchImage from "@/views/MatchImage.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/match/:id",
      name: "view",
      component: MatchView,
    },
    {
      path: "/match-edit/:id",
      name: "edit",
      component: MatchEdit,
    },
    {
      path: "/match-image/:id",
      name: "image",
      component: MatchImage,
    },
  ],
});

export default router;
