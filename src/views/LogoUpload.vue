<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLogoStore } from "@/stores/logos";
import { useMatchStore } from "@/stores/matches";
import type { LogoId } from "@/types";

const route = useRoute();
const router = useRouter();
const logoStore = useLogoStore();
const matchStore = useMatchStore();
const { teams } = storeToRefs(matchStore);

// Context from route params
const context = route.params.context as string; // e.g., "match-home", "match-away", "team"
const matchId = route.params.matchId as string | undefined;
const teamId = route.params.teamId as string | undefined;

// State
const searchQuery = ref("");
const uploadName = ref("");
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>("");
const errorMessage = ref("");

// Get filtered logos
const filteredLogos = computed(() => {
  if (!searchQuery.value) {
    return logoStore.allLogos;
  }
  return logoStore.searchLogos(searchQuery.value);
});

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    errorMessage.value = "Please select an image file";
    return;
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = "Image must be smaller than 2MB";
    return;
  }

  errorMessage.value = "";
  selectedFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Upload new logo
const uploadLogo = () => {
  if (!selectedFile.value || !previewUrl.value) {
    errorMessage.value = "Please select a file first";
    return;
  }

  if (!uploadName.value.trim()) {
    errorMessage.value = "Please enter a name for the logo";
    return;
  }

  const logoId = logoStore.addLogo(uploadName.value.trim(), previewUrl.value);
  selectLogo(logoId);
};

// Select existing logo
const selectLogo = (logoId: LogoId) => {
  if (context === "match-home" && matchId) {
    const match = matchStore.getMatch(matchId);
    if (match) {
      // Check if homeLogo is a team reference
      if (match.homeLogo && match.homeLogo.startsWith("team:")) {
        const teamId = match.homeLogo.substring(5);
        const team = teams.value[teamId as any];
        if (team) {
          team.logo = logoId;
          matchStore.saveTeam(team);
        }
      } else {
        // Direct logo assignment to match
        match.homeLogo = logoId;
        matchStore.saveMatch(match);
      }
    }
  } else if (context === "match-away" && matchId) {
    const match = matchStore.getMatch(matchId);
    if (match) {
      // Check if awayLogo is a team reference
      if (match.awayLogo && match.awayLogo.startsWith("team:")) {
        const teamId = match.awayLogo.substring(5);
        const team = teams.value[teamId as any];
        if (team) {
          team.logo = logoId;
          matchStore.saveTeam(team);
        }
      } else {
        // Direct logo assignment to match
        match.awayLogo = logoId;
        matchStore.saveMatch(match);
      }
    }
  } else if (context === "team" && teamId) {
    const team = teams.value[teamId as any];
    if (team) {
      team.logo = logoId;
      matchStore.saveTeam(team);
    }
  }

  // Navigate back
  router.back();
};

// Cancel and go back
const cancel = () => {
  router.back();
};
</script>

<template>
  <main class="logo-upload">
    <h2>Select or Upload Logo</h2>

    <!-- Upload Section -->
    <section class="upload-section">
      <h3>Upload New Logo</h3>
      
      <div class="upload-form">
        <div class="form-group">
          <label for="logo-name">Logo Name:</label>
          <input
            id="logo-name"
            v-model="uploadName"
            type="text"
            placeholder="e.g., Team Logo, Club Crest"
          />
        </div>

        <div class="form-group">
          <label for="logo-file">Select Image:</label>
          <input
            id="logo-file"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="previewUrl" class="preview">
          <img :src="previewUrl" alt="Preview" />
        </div>

        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

        <button
          @click="uploadLogo"
          :disabled="!selectedFile || !uploadName"
          class="btn-upload"
        >
          Upload & Select
        </button>
      </div>
    </section>

    <!-- Search and Gallery Section -->
    <section class="gallery-section">
      <h3>Select Existing Logo</h3>

      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search logos..."
        />
      </div>

      <div class="logo-grid">
        <div
          v-for="logo in filteredLogos"
          :key="logo.id"
          class="logo-item"
          @click="selectLogo(logo.id)"
        >
          <img :src="logo.dataUrl" :alt="logo.name" />
          <span class="logo-name">{{ logo.name }}</span>
        </div>
      </div>

      <div v-if="filteredLogos.length === 0" class="no-results">
        No logos found. Upload a new one above.
      </div>
    </section>

    <div class="actions">
      <button @click="cancel" class="btn-cancel">Cancel</button>
    </div>
  </main>
</template>

<style scoped>
.logo-upload {
  padding: 1em;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 1em;
}

h3 {
  margin-bottom: 0.5em;
  font-size: 1.2em;
}

.upload-section,
.gallery-section {
  margin-bottom: 2em;
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.form-group label {
  font-weight: bold;
}

.form-group input[type="text"] {
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group input[type="file"] {
  padding: 0.5em 0;
}

.preview {
  display: flex;
  justify-content: center;
  padding: 1em;
  background: #f5f5f5;
  border-radius: 4px;
}

.preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.error {
  color: red;
  padding: 0.5em;
  background: #fee;
  border-radius: 4px;
}

.btn-upload {
  padding: 0.75em 1.5em;
  font-size: 1em;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-upload:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-upload:hover:not(:disabled) {
  background: #45a049;
}

.search-box {
  margin-bottom: 1em;
}

.search-box input {
  width: 100%;
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1em;
}

.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em;
  border: 2px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logo-item:hover {
  border-color: #4CAF50;
  transform: scale(1.05);
}

.logo-item img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.logo-name {
  font-size: 0.85em;
  text-align: center;
  word-break: break-word;
}

.no-results {
  text-align: center;
  padding: 2em;
  color: #666;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 2em;
}

.btn-cancel {
  padding: 0.75em 1.5em;
  font-size: 1em;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #da190b;
}
</style>
