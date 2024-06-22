<script setup lang="ts">
import { EventType, getAllEventsSorted } from "@/match";
import type { Period } from "@/types";
import { computed } from "vue";

const props = defineProps<{
  period: Period;
}>();
const chartData = computed(() => {
  const events = getAllEventsSorted(props.period);
  const startTime = events[0][1][0];
  const endTime = events[events.length - 1][1][0];
  const totalTime = endTime - startTime;
  const slotTime = totalTime / 50;
  let time = startTime;
  let prev = events[0][0];
  let prevTime = time;
  const lines = [];
  let x = 0;
  console.log(time, endTime, time < endTime);
  while (time < endTime) {
    if (prevTime < time) prevTime = time;
    const times = [0, 0];
    const slotEvents = events.filter((x) => x[1][0] >= time && x[1][0] < time + slotTime);
    const after = events.find((x) => x[1][0] >= time + slotTime);
    slotEvents.forEach((x) => {
      if (x[0] == prev && x[2] == EventType.Touch) {
        let t = x[1][0] - prevTime - x[1][1];
        if (t > 0) times[x[0] == "H" ? 0 : 1] += t;
      }
      prevTime = x[1][0];
      prev = x[0];
    });
    if (after) {
      if (prev == after[0] && after[2] == EventType.Touch) {
        const t = time + slotTime - prevTime - after[1][1];
        if (t > 0) times[after[0] == "H" ? 0 : 1] += t;
      }
    }
    console.log(times);
    lines.push([x, 50, x, 50 - 50 * (times[0] / slotTime), 2]);
    lines.push([x, 50, x, 50 + 50 * (times[1] / slotTime), 2]);
    x += 2;
    time += slotTime;
  }

  const homeGoals = props.period.home.goals.map((x) => {
    const t = ((x[0] - startTime) / totalTime) * 100;
    return t;
  });
  const awayGoals = props.period.away.goals.map((x) => {
    const t = ((x[0] - startTime) / totalTime) * 100;
    return t;
  });

  return { lines, homeGoals, awayGoals };
});
</script>

<template>
  <svg class="chart" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="50" x2="100" y2="50" stroke="black" />
    <line
      v-for="(line, i) in chartData.lines"
      v-bind:key="i"
      :x1="line[0]"
      :y1="line[1]"
      :x2="line[2]"
      :y2="line[3]"
      :stroke="i % 2 == 0 ? '#88f' : '#0d0'"
      :stroke-width="line[4]"
    />
    <line
      v-for="(g, i) in chartData.homeGoals"
      v-bind:key="i"
      :x1="g"
      :x2="g"
      y1="10"
      y2="50"
      g
      fill="none"
      stroke="black"
    />
    <text v-for="(g, i) in chartData.homeGoals" v-bind:key="i" :x="g" y="10" text-anchor="middle">
      &#x26BD;
    </text>
    <line
      v-for="(g, i) in chartData.awayGoals"
      v-bind:key="i"
      :x1="g"
      :x2="g"
      y1="90"
      y2="50"
      g
      fill="none"
      stroke="black"
    />
    <text v-for="(g, i) in chartData.awayGoals" v-bind:key="i" :x="g" y="90" text-anchor="middle">
      &#x26BD;
    </text>
  </svg>
</template>
