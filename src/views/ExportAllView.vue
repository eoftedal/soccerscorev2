<script lang="ts" setup>
import StyledButton from "@/components/StyledButton.vue";
import { saveBlob } from "./viewUtils";
import { useMatchStore } from "@/stores/matches";
import { useLogoStore } from "@/stores/logos";
import { ref } from "vue";
import type { Logo, Match, Team } from "@/models/types";

const store = useMatchStore();
const logoStore = useLogoStore();

const file = ref<File | null>(null);
const isReadingFile = ref<boolean>(false);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const selectedFile = target.files[0];
    file.value = selectedFile;
    readJsonFile(selectedFile);
  }
};
const teams = ref<Team[]>([]);
const matches = ref<Match[]>([]);
const logos = ref<Logo[]>([]);

const readJsonFile = (file: File) => {
  isReadingFile.value = true;
  const reader = new FileReader();
  teams.value = [];
  matches.value = [];
  logos.value = [];

  reader.onload = (e) => {
    isReadingFile.value = false;
    try {
      const data = JSON.parse(e.target?.result as string) as {
        teams: Team[];
        matches: Match[];
        logos: Logo[];
      };
      teams.value = data.teams;
      matches.value = data.matches;
      logos.value = data.logos;
    } catch {
      alert("Error parsing match data");
    }
  };
  reader.readAsText(file);
};

function importAll() {
  teams.value.forEach((t) => store.saveTeam(t));
  matches.value.forEach((m) => store.saveMatch(m));
  logos.value.forEach((l) => logoStore.importLogo(l));
}
function download() {
  const data = {
    teams: Object.values(store.teams),
    matches: Object.values(store.teams)
      .map((t) => store.getMatches(t.id))
      .reduce((a, b) => a.concat(b), []),
    logos: Object.values(logoStore.allLogos),
  };
  const asText = JSON.stringify(data);
  const file = new Blob([asText], { type: "application/json" });
  const date = new Date().toISOString().split("T")[0];
  saveBlob(file, `full-export-${date}.json`);
}
</script>
<template>
  <main>
    <h2>Import matches</h2>
    <div>
      <input type="file" @change="handleFileUpload" accept="application/json" />

      <div v-if="file && !isReadingFile">
        <div>Teams: {{ teams.length }}</div>
        <div>Matches: {{ matches.length }}</div>
        <div>Logos: {{ logos.length }}</div>

        <StyledButton @click="importAll()">Import</StyledButton>
      </div>
      <div v-else-if="isReadingFile">Reading file...</div>
    </div>
    <h2>Export matches</h2>

    <div class="buttons">
      <StyledButton @click="download()">Export all</StyledButton>
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 2em;
}
</style>
