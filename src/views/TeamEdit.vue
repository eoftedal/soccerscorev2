<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { reactive, ref } from "vue";
import { type TeamId } from "@/types";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const teamId = route.params.id as TeamId;

const { saveTeam } = useMatchStore();
const { teams } = storeToRefs(useMatchStore());

const team = teams.value[teamId];
if (!team) {
  router.push({ name: "home" });
}

const state = reactive({
  teamName: team?.name ?? "",
  logo: team?.logo ?? ""
});

const fileInput = ref<HTMLInputElement | null>(null);

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (e.g., max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('Image size must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      state.logo = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function removeLogo() {
  state.logo = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function save() {
  if (!team) return;
  
  team.name = state.teamName;
  team.logo = state.logo || undefined;
  
  saveTeam(team);
  router.back()
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
        v-model="state.teamName" 
        placeholder="Team name" 
      />
    </div>

    <div class="form-group">
      <label>Team Logo</label>
      <div class="logo-section">
        <div v-if="state.logo" class="logo-preview">
          <img :src="state.logo" alt="Team logo" />
          <button type="button" @click="removeLogo" class="remove-btn">Remove Logo</button>
        </div>
        <div v-else class="no-logo">
          <p>No logo uploaded</p>
        </div>
        <input 
          ref="fileInput"
          type="file" 
          accept="image/*" 
          @change="handleLogoUpload"
          class="file-input"
        />
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
