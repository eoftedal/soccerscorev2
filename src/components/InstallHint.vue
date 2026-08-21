<script setup lang="ts">
import { computed, ref } from "vue";
import { mdiExportVariant } from "@mdi/js";

const DISMISS_KEY = "installHintDismissed";

// iOS Safari (iPhone/iPad, incl. iPadOS reporting as Mac with touch)
const isIos = (() => {
  const ua = window.navigator.userAgent;
  const iOsDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOsDevice || iPadOs;
})();

// Already launched from the home screen?
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  // Safari-specific flag
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const dismissed = ref(localStorage.getItem(DISMISS_KEY) === "1");

const show = computed(() => isIos && !isStandalone && !dismissed.value);

function dismiss() {
  dismissed.value = true;
  localStorage.setItem(DISMISS_KEY, "1");
}
</script>

<template>
  <div v-if="show" class="install-hint">
    <button class="close" aria-label="Dismiss" @click="dismiss()">&times;</button>
    <p>
      Install this as an app: tap
      <!-- iOS Share icon -->
      <svg
        class="share-icon"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Share"
      >
        <path :d="mdiExportVariant" fill="currentColor" />
      </svg>
      then <strong>Add to Home Screen</strong>.
    </p>
  </div>
</template>

<style scoped>
.install-hint {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.75em 2.25em 0.75em 1em;
  margin-bottom: 1.5em;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
  font-size: 90%;
}

.install-hint p {
  margin: 0;
}

.share-icon {
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.2em;
  margin: 0 0.1em;
}

.close {
  position: absolute;
  top: 0.25em;
  right: 0.5em;
  border: none;
  background: none;
  font-size: 1.4em;
  line-height: 1;
  cursor: pointer;
  color: inherit;
  padding: 0.1em 0.25em;
}
</style>
