<script setup lang="ts">
import { type Match } from "@/models/types";
import ActivityRow from "./ActivityRow.vue";
import { msToTimeString } from "@/timeUtils";
import {
  getMatchAveragePassStrings,
  getMatchPassAcc,
  getMatchPasses,
  getMatchPassStrings,
  getMatchPossession,
  getMatchRecoveryTime,
  getMatchShotAccuracy,
  getMatchShots,
  getMatchTotalStat,
} from "@/models/match";

const props = defineProps<{
  match: Match;
  svgPlaceHolder?: boolean;
}>();

function firstTwo(data: number[]): [number, number] {
  return [data[0], data[1]];
}
function chunk(data: number[], chunkSize: number = 2) {
  const result = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    result.push(data.slice(i, i + chunkSize));
  }
  return result;
}
function getLongestStringMatch(match: Match): [number, number] {
  const passStrings = getMatchPassStrings(match);
  return [passStrings[0].length - 1, passStrings[1].length - 1];
}
function getMatchAverageRecoveryTime(match?: Match): [number, number] {
  if (!match) return [0, 0];
  const data = getMatchRecoveryTime(match);
  return [data[0][0] / data[0][1] / 1000, data[1][0] / data[1][1] / 1000];
}
</script>
<template>
  <div class="column">
    <svg height="100" width="100" v-if="props.svgPlaceHolder"></svg>
    <slot name="header" />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'goals'),
        getMatchTotalStat(props.match, 'away', 'goals'),
      ]"
    />
    <ActivityRow :values="getMatchShots(props.match)" />
    <ActivityRow
      :values="getMatchShotAccuracy(props.match)"
      :formatter="(n) => n.toFixed(1)"
      percentage
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'corners'),
        getMatchTotalStat(props.match, 'away', 'corners'),
      ]"
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'offsides'),
        getMatchTotalStat(props.match, 'away', 'offsides'),
      ]"
      :invert="true"
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'freekicks'),
        getMatchTotalStat(props.match, 'away', 'freekicks'),
      ]"
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'penalties'),
        getMatchTotalStat(props.match, 'away', 'penalties'),
      ]"
    />
    <ActivityRow
      :values="firstTwo(getMatchPossession(props.match))"
      :percentage="true"
      :formatter="(n) => n.toFixed(1)"
    />
    <ActivityRow
      :values="firstTwo(chunk(getMatchPossession(props.match))[1])"
      :formatter="msToTimeString"
    />
    <ActivityRow
      :values="getMatchAverageRecoveryTime(props.match)"
      :formatter="(n) => n.toFixed(1)"
      :invert="true"
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'touches'),
        getMatchTotalStat(props.match, 'away', 'touches'),
      ]"
    />
    <ActivityRow
      :values="getMatchPassAcc(props.match)"
      percentage
      :formatter="(n) => n.toFixed(1)"
    />
    <ActivityRow :values="getMatchPasses(props.match)" />
    <template v-for="(l, j) in [3, 5, 7]" v-bind:key="j">
      <ActivityRow :values="firstTwo(getMatchPassStrings(props.match).map((x) => x[l]))" />
    </template>
    <ActivityRow :values="getLongestStringMatch(props.match)" />
    <ActivityRow
      :values="getMatchAveragePassStrings(props.match)"
      :formatter="(n) => n.toFixed(1)"
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'yellowCards'),
        getMatchTotalStat(props.match, 'away', 'yellowCards'),
      ]"
      :invert="true"
    />
    <ActivityRow
      :values="[
        getMatchTotalStat(props.match, 'home', 'redCards'),
        getMatchTotalStat(props.match, 'away', 'redCards'),
      ]"
      :invert="true"
    />
  </div>
</template>
