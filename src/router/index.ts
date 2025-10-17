import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ExportView from "../views/ExportView.vue";
import MatchView from "@/views/MatchView.vue";
import MatchEdit from "@/views/MatchEdit.vue";
import MatchImage from "@/views/MatchImage.vue";
import TestView from "@/views/TestView.vue";
import TeamView from "@/views/TeamView.vue";
import TeamEdit from "@/views/TeamEdit.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/team/:id",
      name: "team",
      component: TeamView,
    },
    {
      path: "/team-edit/:id",
      name: "team-edit",
      component: TeamEdit,
    },
    {
      path: "/export/:id",
      name: "export",
      component: ExportView,
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
    {
      path: "/birthday",
      name: "birthday",
      component: () => import("../views/BirthdayView.vue"),
    },
    {
      path: "/test",
      name: "test",
      component: TestView,
    },
  ],
});

export default router;
