<script setup lang="ts">
import { reactive } from "vue";

const emit = defineEmits<{
  (e: "add", time: number, delta: number): void;
  (e: "remove"): void;
}>();
const state = reactive({
  holdStart: undefined as undefined | number,
});

function add() {
  const t = Date.now();
  const delta = state.holdStart ? t - state.holdStart : 0;
  emit("add", t, delta);
  state.holdStart = undefined;
}
function remove() {
  emit("remove");
}
</script>
<template>
  <div class="button">
    <button
      class="plus"
      @touchstart.prevent="state.holdStart = Date.now()"
      @touchend.prevent="add()"
    >
      <slot></slot>
    </button>
    <button @touchstart.prevent="" @touchend.prevent="remove()" class="minus">-</button>
  </div>
</template>
