<script setup lang="ts">
import { type Match } from "@/models/types";
import { computed } from "vue";
import HeaderColumn from "./HeaderColumn.vue";
import PeriodColumn from "./PeriodColumn.vue";
import MatchColumn from "./MatchColumn.vue";

const props = defineProps<{
  match: Match;
  hidePeriods?: boolean;
  hideHeader?: boolean;
}>();

const sizeDivider = computed(() => {
  if (props.match.periods.length > 3) {
    return "calc(100vw/52)";
  } else if (props.match.periods.length > 2) {
    return "calc(100vw/42)";
  }
  return "calc(100vw/36)";
});
</script>

<template>
  <div class="outerWrapper">
    <div class="innerWrapper" :style="{ fontSize: sizeDivider }">
      <div class="columns">
        <HeaderColumn :svg-place-holder="true" />
        <PeriodColumn v-for="(p, i) of props.match.periods" :period="p" v-bind:key="i" />
        <MatchColumn :match="props.match" :svg-place-holder="true" />
      </div>
    </div>
  </div>
</template>
<style>
input[type="range"] {
  margin-left: 100px;
  width: 200px;
}
.columns {
  display: flex;
}

.columns .column:first-child {
  background: var(--color-bg);
  position: sticky;
}
.column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.column svg {
  border-left: 1px dashed #999;
  flex-grow: 0;
  flex-shrink: 0;
  margin-bottom: 1em;
}

.column:first-child svg {
  border-left: none;
}
.column:nth-child(2) svg {
  border-left: none;
}
.column:last-child svg {
  border-left: none;
}

.outerWrapper {
  width: 100%;
  display: flex;
  overflow-x: auto;
  justify-content: space-around;
  margin-bottom: 2em;
}

.innerWrapper {
  display: inline-block;
  width: auto;
}

svg,
.placeholder {
  height: 8em;
}
svg,
.placeholder,
.row {
  width: 8em;
  overflow: hidden;
}
.row {
  display: flex;
}
.row span {
  text-align: right;
  width: 50%;
  padding: 0px 2px;
}
.row span:nth-child(2) {
  text-align: left;
}
.row span:first-child {
  border-right: 1px solid var(--color-border-hover);
}
</style>
