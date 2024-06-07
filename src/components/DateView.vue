<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  time: number;
}>();
const formatted = computed(() => {
  const date = new Date(props.time);
  return date.toISOString().split(":").slice(0, 2).join(":").replace("T", " ");
});
</script>
<template>
  <span>{{ formatted }}</span>
</template>
