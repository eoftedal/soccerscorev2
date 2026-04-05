<script lang="ts" setup>
import StyledButton from "@/components/StyledButton.vue";
import { saveBlob } from "./viewUtils";
import { useMatchStore } from "@/stores/matches";
import { ref } from "vue";
import type { Match, Team } from "@/models/types";

const store = useMatchStore();
const file = ref<File | null>(null);

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


const readJsonFile = (file: File) => {
  const reader = new FileReader();
  teams.value = [];
  matches.value = [];

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as { teams: Team[], matches: Match[] };
      teams.value = data.teams;
      matches.value = data.matches;
    } catch (error) {
      alert("Error parsing match data");
    }
  };
  reader.readAsText(file);
};

function importAll() {
    teams.value.forEach(t => store.saveTeam(t));
    matches.value.forEach(m => store.saveMatch(m));
}
function download() {
    const data = {
        teams: Object.values(store.teams),
        matches: Object.values(store.teams).map(t => store.getMatches(t.id)).reduce((a,b) => a.concat(b), [])
    };
    const asText = JSON.stringify(data);
    const file = new Blob([asText], { type: "application/json" });
    saveBlob(file, "full-export-2024-04-05.json")
}

</script>
<template>
<main>
    <h2>Import matches</h2>
    <div>
      <input type="file" @change="handleFileUpload" accept="application/json" />

      <div v-if="file">
      <div>Teams: {{ teams.length }}</div>
      <div>Matches: {{ matches.length }}</div>

      <StyledButton @click="importAll()">Import</StyledButton>
      </div>
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