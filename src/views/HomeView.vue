<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { useLogos } from "@/composables/useLogos";
import type { TeamName } from "@/types";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRouter } from "vue-router";

const buildDate = import.meta.env.VITE_BUILD_DATE;

const matchStore = useMatchStore();
const { teams, matches } = storeToRefs(matchStore);
const { getLogoUrl } = useLogos();
const router = useRouter();

const hasUnassignedMatches = computed(() => {
  return matches.value.some((m) => !m.belongsTo);
});

function addTeam() {
  const team = matchStore.newTeam("New Team" as TeamName);
  router.push({ name: "team-edit", params: { id: team.id } });
}

function reload() {
  location.href = ".?" + new Date().getTime();
}

function navigateToUnassigned() {
  router.push({ name: "team", params: { id: "unassigned" } });
}
</script>
<template>
  <main>
    <h2>Teams</h2>
    <div class="teams-grid">
      <div
        v-for="t in teams"
        :key="t.id"
        class="team-card"
        @click="router.push({ name: 'team', params: { id: t.id } })"
      >
        <div class="logo-container">
          <img
            v-if="getLogoUrl(t.logo)"
            :src="getLogoUrl(t.logo)"
            :alt="t.name + ' logo'"
            class="team-logo"
          />
          <svg
            v-else
            class="default-crest"
            viewBox="0 0 100 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 10 10 L 90 10 L 90 80 L 50 110 L 10 80 Z" />
          </svg>
        </div>
        <div class="team-name">{{ t.name }}</div>
      </div>
      <div v-if="hasUnassignedMatches" class="team-card unassigned" @click="navigateToUnassigned()">
        <div class="logo-container">
          <svg class="default-crest" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 10 L 90 10 L 90 80 L 50 110 L 10 80 Z" />
          </svg>
        </div>
        <div class="team-name">Unassigned</div>
      </div>
    </div>
    <button @click="addTeam()">Add team</button>
    <footer @click="reload()">Version: {{ buildDate }}</footer>
  </main>
</template>

<style scoped>
main {
  margin: 2em;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
  margin-bottom: 2em;
}

.team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5em 1em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-background-soft);
}

.team-card:hover {
  background-color: var(--color-background-mute);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logo-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75em;
}

.team-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.default-crest {
  width: 60px;
  height: 72px;
  fill: #ccc;
}

.team-name {
  text-align: center;
  font-weight: 500;
  word-break: break-word;
  max-width: 100%;
}

footer {
  margin-top: 2em;
  font-size: 80%;
  text-align: center;
}
</style>
