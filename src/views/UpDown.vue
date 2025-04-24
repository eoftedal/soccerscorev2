<script setup lang="ts">
import { reactive } from "vue";
import { setActive, setInactive } from "./buttonUtil";

const emit = defineEmits<{
  (e: "add", time: number, delta: number): void;
  (e: "remove"): void;
  (e: "holdStart", start: number): void;
  (e: "holdEnd", start: number, end: number): void;
}>();
const state = reactive({
  holdStart: undefined as undefined | number,
});

function add() {
  const t = Date.now();
  const delta = state.holdStart ? t - state.holdStart : 0;
  emit("holdEnd", state.holdStart ?? t, t);
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
      @touchstart.prevent="
        state.holdStart = Date.now();
        emit('holdStart', state.holdStart);
        setActive($event);
      "
      @touchend.prevent="
        add();
        setInactive($event);
      "
    >
      <slot></slot>
    </button>
    <button
      @touchstart.prevent="setActive($event)"
      @touchend.prevent="
        remove();
        setInactive($event);
      "
      class="minus"
    >
      -
    </button>
  </div>
</template>

<style scoped>
button {
  padding-left: 0.5em;
  padding-right: 0.5em;
}
</style>
