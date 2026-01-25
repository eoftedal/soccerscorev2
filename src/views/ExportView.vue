<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { useLogoStore } from "@/stores/logos";
import { useLogos } from "@/composables/useLogos";
import { computed, reactive, ref } from "vue";
import { type Match, type TeamId, type ExportMatch, type DataUrl } from "@/models/types";
import { saveBlob } from "./viewUtils";
import { useRoute } from "vue-router";

const route = useRoute();
const teamId = route.params.id as TeamId;
const isUnassigned = teamId === "unassigned";

const { matches, saveMatch } = useMatchStore();
const logoStore = useLogoStore();
const { getLogoUrl } = useLogos();

const state = reactive({
  selected: new Map<string, Match>(),
});

function score(match: Match) {
  if (match.state == "not_started") return "";
  return match.periods
    .reduce((c, p) => [c[0] + p.home.goals.length, c[1] + p.away.goals.length], [0, 0])
    .join(" - ");
}

const sorted = computed(() => {
  const filterFn = isUnassigned ? (m: Match) => !m.belongsTo : (m: Match) => m.belongsTo == teamId;

  return matches
    .slice()
    .filter(filterFn)
    .sort((a, b) => {
      return (
        new Date(b.date + "T" + b.time + ":00").getTime() -
        new Date(a.date + "T" + a.time + ":00").getTime()
      );
    });
});

const finished = computed(() => {
  return sorted.value.filter((m) => m.state == "finished");
});
function toggleSelected(match: Match) {
  if (state.selected.has(match.id)) {
    state.selected.delete(match.id);
  } else {
    state.selected.set(match.id, match);
  }
}

function download() {
  // Create a deep copy of matches and replace logo IDs with data URLs
  const matchesToExport: ExportMatch[] = Array.from(state.selected.values()).map((match) => {
    const exportMatch = { ...match } as ExportMatch;

    // Replace home logo ID with data URL
    if (match.homeLogo) {
      const logoUrl = getLogoUrl(match.homeLogo);
      if (logoUrl) {
        exportMatch.homeLogo = logoUrl;
      }
    }

    // Replace away logo ID with data URL
    if (match.awayLogo) {
      const logoUrl = getLogoUrl(match.awayLogo);
      if (logoUrl) {
        exportMatch.awayLogo = logoUrl;
      }
    }

    return exportMatch;
  });

  const data = JSON.stringify(matchesToExport);
  const file = new Blob([data], { type: "application/json" });
  const date = new Date().toISOString().split("T")[0];
  saveBlob(file, `soccerscorev2-export-${date}.json`);
}
function selectAll() {
  for (const m of finished.value) {
    state.selected.set(m.id, m);
  }
}
const file = ref<File | null>(null);
const importMatches = ref<Match[]>([]);

const handleFileUpload = (event: Event) => {
  importMatches.value = [];
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const selectedFile = target.files[0];
    file.value = selectedFile;
    readJsonFile(selectedFile);
  }
};
const readJsonFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      importMatches.value = Array.isArray(data) ? data : [data];
    } catch (error) {
      alert("Error parsing match data");
    }
  };
  reader.readAsText(file);
};

function saveImportMatches() {
  for (const m of importMatches.value) {
    // Migrate home logo if it's a data URL
    if (m.homeLogo && m.homeLogo.startsWith("data:")) {
      let logoId = logoStore.findLogoByDataUrl(m.homeLogo);

      if (!logoId) {
        // Create new logo entry
        logoId = logoStore.addLogo(m.homeTeam, m.homeLogo as DataUrl);
      }

      // Update match to reference logo ID
      m.homeLogo = logoId;
    }

    // Migrate away logo if it's a data URL
    if (m.awayLogo && m.awayLogo.startsWith("data:")) {
      let logoId = logoStore.findLogoByDataUrl(m.awayLogo);

      if (!logoId) {
        // Create new logo entry
        logoId = logoStore.addLogo(m.awayTeam, m.awayLogo as DataUrl);
      }

      // Update match to reference logo ID
      m.awayLogo = logoId;
    }

    if (!isUnassigned) {
      m.belongsTo = teamId;
    }
    saveMatch(m);
  }
  importMatches.value = [];
}
</script>

<template>
  <main>
    <h2>Import matches</h2>
    <div>
      <input type="file" @change="handleFileUpload" accept="application/json" />
      <ul class="import" v-if="importMatches.length > 0">
        <li v-for="m in importMatches" v-bind:key="m.id">
          <div>{{ m.date }} {{ m.time }} {{ m.homeTeam }} - {{ m.awayTeam }} {{ score(m) }}</div>
        </li>
      </ul>
      <button v-if="importMatches.length > 0" @click="saveImportMatches()">Import</button>
    </div>
    <h2>Export matches</h2>

    <ul class="export">
      <li v-for="m in finished" v-bind:key="m.id">
        <input type="checkbox" @change="toggleSelected(m)" :checked="state.selected.has(m.id)" />
        <div @click="toggleSelected(m)">
          {{ m.date }} - {{ m.homeTeam }} - {{ m.awayTeam }} {{ score(m) }}
        </div>
      </li>
    </ul>
    <div class="buttons">
      <button @click="selectAll()">Select all</button>
      <button @click="download()" :disabled="state.selected.size == 0">Download</button>
    </div>
  </main>
</template>
<style scoped>
main {
  margin: 2em;
}
.buttons {
  display: flex;
}
li {
  display: flex;
}
li:has(input:checked) {
  background-color: var(--color-background-mute);
}
ul.import {
  padding-left: 0;
}
ul.export {
  margin-left: 0;
  padding-left: 0;
  list-style-type: none;
}
ul.export input[type="checkbox"] {
  margin-right: 0.5em;
}
h2 {
  margin-top: 1em;
}
</style>
