<script setup lang="ts">
import type { Period } from "@/models/types";
import PeriodChart from "./PeriodChart.vue";
import ActivityRow from "./ActivityRow.vue";
import {
  getPeriodPassAcc,
  getPeriodPasses,
  getPeriodPassStrings,
  getPeriodPossession,
  getPeriodRecoveryTime,
  getPeriodShotAccuracy,
  getPeriodShots,
} from "@/models/match";
import { msToTimeString } from "@/timeUtils";

const props = defineProps<{
  period: Period;
}>();
const period = props.period;

function getAverageRecoveryTime(period: Period): [number, number] {
  const data = getPeriodRecoveryTime(period);
  return [data[0][0] / data[0][1] / 1000, data[1][0] / data[1][1] / 1000];
}
function getLongestString(period: Period): [number, number] {
  const passStrings = getPeriodPassStrings(period);
  return [passStrings[0].length - 1, passStrings[1].length - 1];
}
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
</script>
<template>
  <div class="column">
    <PeriodChart :period="period" :invert="false" />
    <ActivityRow :values="[period.home.goals.length, period.away.goals.length]" />
    <ActivityRow :values="getPeriodShots(period)" />
    <ActivityRow
      :values="getPeriodShotAccuracy(period)"
      :formatter="(n) => n.toFixed(1)"
      :percentage="true"
    />
    <ActivityRow :values="[period.home.corners.length, period.away.corners.length]" />
    <ActivityRow
      :values="[period.home.offsides?.length ?? 0, period.away.offsides?.length ?? 0]"
      :invert="true"
    />
    <ActivityRow :values="[period.home.freekicks.length, period.away.freekicks.length]" />
    <ActivityRow :values="[period.home.penalties.length, period.away.penalties.length]" />
    <ActivityRow
      :values="firstTwo(getPeriodPossession(period))"
      :percentage="true"
      :formatter="(n) => n.toFixed(1)"
    />
    <ActivityRow
      :values="firstTwo(chunk(getPeriodPossession(period))[1])"
      :formatter="msToTimeString"
    />
    <ActivityRow
      :values="getAverageRecoveryTime(period)"
      :formatter="(n) => n.toFixed(1)"
      :invert="true"
    />

    <ActivityRow :values="[period.home.touches.length, period.away.touches.length]" />
    <ActivityRow :values="getPeriodPassAcc(period)" :formatter="(n) => n.toFixed(1)" percentage />
    <ActivityRow :values="getPeriodPasses(period)" />
    <template v-for="(l, j) in [3, 5, 7]" v-bind:key="j">
      <ActivityRow
        :values="
          firstTwo(
            getPeriodPassStrings(period)
              .slice(0, 2)
              .map((x) => (x as number[])[l]),
          )
        "
      />
    </template>
    <ActivityRow :values="getLongestString(period)" />
    <ActivityRow
      :values="getPeriodPassStrings(period).slice(2, 4) as [number, number]"
      :formatter="(n) => n.toFixed(1)"
    />
    <ActivityRow
      :values="[period.home.yellowCards.length, period.away.yellowCards.length]"
      :invert="true"
    />
    <ActivityRow
      :values="[period.home.redCards.length, period.away.redCards.length]"
      :invert="true"
    />
  </div>
</template>
