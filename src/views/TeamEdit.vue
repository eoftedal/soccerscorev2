<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { useLogoStore } from "@/stores/logos";
import { computed } from "vue";
import { type TeamId } from "@/types";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const teamId = route.params.id as TeamId;

const { saveTeam } = useMatchStore();
const { teams } = storeToRefs(useMatchStore());
const logoStore = useLogoStore();

const team = teams.value[teamId];
if (!team) {
  router.push({ name: "home" });
}

const logoUrl = computed(() => {
  if (!team?.logo) return undefined;
  return logoStore.getLogoUrl(team.logo as any);
});

function navigateToLogoUpload() {
  router.push({
    name: "logo-upload",
    params: {
      context: "team",
      teamId: teamId,
    },
  });
}

function removeLogo() {
  if (!team) return;
  team.logo = undefined;
  saveTeam(team);
}

function save() {
  if (!team) return;
  saveTeam(team);
  router.back();
}

function cancel() {
  router.back();
}
</script>

<template>
  <main>
    <h1>Edit Team</h1>
    
    <div class="form-group">
      <label for="teamName">Team Name</label>
      <input 
        id="teamName"
        type="text" 
        v-model="team.name" 
        placeholder="Team name" 
      />
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
      <label for="displayName">Home ground</label>
      <input 
        id="displayName"
        type="text" 
        v-model="team.homeground" 
        placeholder="Home ground for matches" 
      />
    </div>



    <div class="form-group">
      <label>Team Logo</label>
      <div class="logo-section">
        <div v-if="logoUrl" class="logo-preview">
          <img :src="logoUrl" alt="Team logo" />
          <button type="button" @click="removeLogo" class="remove-btn">Remove Logo</button>
        </div>
        <div v-else class="no-logo">
          <p>No logo uploaded</p>
        </div>
        <button type="button" @click="navigateToLogoUpload" class="upload-btn">
          {{ logoUrl ? 'Change Logo' : 'Upload Logo' }}
        </button>
      </div>
    </div>

    <div class="toolbar">
      <button @click="save">Save</button>
      <button @click="cancel" class="secondary">Cancel</button>
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
