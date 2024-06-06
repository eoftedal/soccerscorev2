<script setup lang="ts">
import { reactive } from "vue";
import { setActive, setInactive } from "./buttonUtil";

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
      @touchstart.prevent="
        state.holdStart = Date.now();
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
