<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed, reactive } from "vue";
import { type Match, type TeamId } from "@/models/types";
import { getMatchScore, sortMatchesByDateTime } from "@/models/match";
import { useRoute, useRouter } from "vue-router";
import StyledButton from "@/components/StyledButton.vue";

const route = useRoute();
const router = useRouter();
const teamId = route.params.id as TeamId;
const isUnassigned = teamId === "unassigned";

const { matches } = useMatchStore();

const state = reactive({
  selected: new Map<string, Match>(),
});

const sorted = computed(() => {
  const filterFn = isUnassigned ? (m: Match) => !m.belongsTo : (m: Match) => m.belongsTo == teamId;
  const filtered = matches.filter(filterFn);
  return sortMatchesByDateTime(filtered);
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

function selectAll() {
  for (const m of finished.value) {
    state.selected.set(m.id, m);
  }
}

function generateImage() {
  const selectedIds = Array.from(state.selected.keys());
  router.push({
    name: "multi-match-image",
    params: { id: teamId },
    query: { matches: selectedIds.join(",") },
  });
}
</script>

<template>
  <main>
    <h2>Select matches for image</h2>

    <ul class="matchList">
      <li v-for="m in finished" v-bind:key="m.id">
        <input type="checkbox" @change="toggleSelected(m)" :checked="state.selected.has(m.id)" />
        <div @click="toggleSelected(m)">
          {{ m.date }} - {{ m.homeTeam }} - {{ m.awayTeam }} {{ getMatchScore(m) }}
        </div>
      </li>
    </ul>
    <div class="buttons">
      <StyledButton @click="selectAll()">Select all</StyledButton>
      <StyledButton @click="generateImage()" :disabled="state.selected.size == 0"
        >Generate image</StyledButton
      >
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
ul.matchList {
  margin-left: 0;
  padding-left: 0;
  list-style-type: none;
}
ul.matchList input[type="checkbox"] {
  margin-right: 0.5em;
}
h2 {
  margin-top: 1em;
}
</style>
