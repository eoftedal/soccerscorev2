<script setup lang="ts">
import { reactive } from "vue";
import { setActive, setInactive } from "./buttonUtil";
import type { Delta, Timestamp } from "@/types";
import { delta, now } from "@/timeUtils";

const emit = defineEmits<{
  (e: "add", time: Timestamp, delta: Delta): void;
  (e: "remove"): void;
  (e: "holdStart", start: Timestamp): void;
  (e: "holdEnd", start: Timestamp, end: Timestamp): void;
}>();
const state = reactive({
  holdStart: undefined as undefined | Timestamp,
});

function add() {
  const t = now();
  const d = delta(t, state.holdStart);
  emit("holdEnd", state.holdStart ?? t, t);
  emit("add", t, d);
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
        state.holdStart = now();
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
