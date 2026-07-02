<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { useLogos } from "@/composables/useLogos";
import { computed, watch } from "vue";
import { gameTypes, type PeriodLength, type TeamId } from "@/models/types";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import StyledButton from "@/components/StyledButton.vue";

const router = useRouter();
const route = useRoute();
const teamId = route.params.id as TeamId;

const matchStore = useMatchStore();
const { saveTeam } = matchStore;
const { teams } = storeToRefs(matchStore);
const { getLogoUrl } = useLogos();

// Teams are loaded asynchronously, so the team may not be present yet on a page reload
const team = computed(() => teams.value[teamId]);

watch(
  team,
  (t) => {
    if (!t) return;
    t.defaultGameType = t.defaultGameType ?? "11v11";
    t.defaultPeriodLength = t.defaultPeriodLength ?? (35 as PeriodLength);
  },
  { immediate: true },
);

matchStore.initialized.then(() => {
  if (!team.value) router.push({ name: "home" });
});

const logoUrl = computed(() => {
  if (!team.value?.logo) return undefined;
  return getLogoUrl(team.value.logo);
});

function navigateToLogoUpload() {
  router.push({
    name: "logo-upload",
    params: {
      context: "team",
      id: teamId,
    },
  });
}

function removeLogo() {
  if (!team.value) return;
  team.value.logo = undefined;
  saveTeam(team.value);
}

function save() {
  if (!team.value) return;
  saveTeam(team.value);
  router.back();
}

function cancel() {
  router.back();
}
</script>

<template>
  <main v-if="team">
    <h1>Edit Team</h1>

    <div class="form-group">
      <label for="teamName">Team Name</label>
      <input id="teamName" type="text" v-model="team.name" placeholder="Team name" />
    </div>

    <div class="form-group">
      <label for="displayName">Display Name (optional)</label>
      <input
        id="displayName"
        type="text"
        v-model="team.displayName"
        placeholder="Display name for matches"
      />
      <small class="help-text">Used as the default team name when creating matches</small>
    </div>

    <div class="form-group">
      <label for="homeground">Home ground</label>
      <input
        id="homeground"
        type="text"
        v-model="team.homeground"
        placeholder="Home ground for matches"
      />
    </div>

    <div class="form-group">
      <label for="defaultGameType">Default Game Type</label>
      <select id="defaultGameType" v-model="team.defaultGameType">
        <option v-for="type in gameTypes" :key="type" :value="type">{{ type }}</option>
      </select>
    </div>

    <div class="form-group">
      <label>Half time:</label>
      <span>{{ team.defaultPeriodLength }} min</span>
      <input type="range" v-model.number="team.defaultPeriodLength" min="10" max="45" />
    </div>

    <div class="form-group">
      <label>Team Logo</label>
      <div class="logo-section">
        <div v-if="logoUrl" class="logo-preview">
          <img :src="logoUrl" alt="Team logo" />
          <StyledButton type="button" @click="removeLogo" class="remove-btn"
            >Remove Logo</StyledButton
          >
        </div>
        <div v-else class="no-logo">
          <p>No logo uploaded</p>
        </div>
        <StyledButton type="button" @click="navigateToLogoUpload" class="upload-btn">
          {{ logoUrl ? "Change Logo" : "Upload Logo" }}
        </StyledButton>
      </div>
    </div>

    <div class="toolbar">
      <StyledButton @click="save">Save</StyledButton>
      <StyledButton @click="cancel" class="secondary">Cancel</StyledButton>
    </div>
  </main>
</template>

<style scoped>
main {
  margin: 2em;
  max-width: 600px;
}

.form-group {
  margin-bottom: 2em;
}

.form-group label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: 500;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.form-group .help-text {
  display: block;
  margin-top: 0.25em;
  font-size: 0.875em;
  color: var(--color-text-muted, #666);
}

.logo-section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.logo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
}

.logo-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1em;
  background: white;
}

.no-logo {
  padding: 2em;
  text-align: center;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-muted, #666);
}

.file-input {
  cursor: pointer;
}

.upload-btn {
  padding: 0.75em 1em;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.upload-btn:hover {
  background-color: #0056b3;
}

.remove-btn {
  padding: 0.5em 1em;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn:hover {
  background-color: #c82333;
}

.toolbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5em 0.5em 0em 0.5em;
}

.toolbar button {
  padding: 1em;
  width: 40%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
