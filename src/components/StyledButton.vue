<script setup lang="ts">
import { useRipple } from "@/composables/useRipple";
import type { IconName } from "./mdiIconsAvailable";
import MdiIcon from "./MdiIcon.vue";

const { onTouchStart } = useRipple();

const props = defineProps<{
  icon?: IconName,
}>();
</script>

<template>
  <button @touchstart.passive="onTouchStart">
    <MdiIcon v-if="props.icon" :icon="props.icon" />
    <div v-if="props.icon"><slot /></div>
    <slot v-if="!props.icon" />
  </button>
</template>

<style scoped>
button {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
}
button > svg {
  margin-right: 0.75em;
  height: 1.5em;
  width: 1.5em;
  flex-shrink: 0;
}
:deep(.ripple) {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.5) 5%,
    rgba(255, 255, 255, 1) 10%,
    rgba(255, 255, 255, 0) 11%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: scale(0);
  transform-origin: center;
  pointer-events: none;
  animation: ripple-animation 0.6s ease-out;
}

@media (prefers-color-scheme: dark) {
  :deep(.ripple) {
    background: radial-gradient(
      circle,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.2) 40%,
      rgba(0, 0, 0, 0) 70%
    );
  }
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
