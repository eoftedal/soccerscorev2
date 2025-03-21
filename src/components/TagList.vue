<script setup lang="ts">
import { ref, watch } from "vue";
const props = defineProps<{
  tags?: string[];
}>();
const emit = defineEmits<{
  (e: "click", tag: string): void;
}>();
const tags = ref(props.tags ?? []);
watch(
  () => props.tags,
  (newVal) => {
    if (newVal) tags.value = newVal;
  },
);
</script>
<template>
  <div class="tag-list">
    <div v-for="tag in tags" :key="tag" class="tag" @click="emit('click', tag)">
      {{ tag }}
    </div>
  </div>
</template>
<style scoped>
.tag-list {
  display: inline-flex;
  flex-wrap: wrap;
  vertical-align: middle;
}
.tag {
  background-color: var(--color-border);
  padding: 0.1em 0.5em;
  margin: 0em 0.2em;
  border-radius: 0.5em;
  cursor: pointer;
  font-size: 0.8em;
  align-items: center;
  vertical-align: middle;
  display: inline-flex;
}
</style>
