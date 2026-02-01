<script setup lang="ts">
import { getPeriodChartData } from "@/models/match";
import type { Period } from "@/models/types";
import { computed } from "vue";

const props = defineProps<{
  period: Period;
  invert: boolean;
}>();
const chartData = computed(() => {
  return getPeriodChartData(props.period);
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
      :stroke="i % 2 == (props.invert ? 1 : 0) ? '#88f' : '#0d0'"
      :stroke-width="line[4]"
    />

    <line
      v-for="(g, i) in chartData.homeRedCards"
      v-bind:key="i"
      :x1="g"
      :x2="g"
      y1="10"
      y2="50"
      g
      fill="none"
      stroke="currentColor"
    />
    <rect
      v-for="(g, i) in chartData.homeRedCards"
      v-bind:key="i"
      :x="g - 4"
      y="0"
      width="8"
      height="12"
      fill="red"
    />

    <line
      v-for="(g, i) in chartData.awayRedCards"
      v-bind:key="i"
      :x1="g"
      :x2="g"
      y1="90"
      y2="50"
      g
      fill="none"
      stroke="currentColor"
    />
    <rect
      v-for="(g, i) in chartData.awayRedCards"
      v-bind:key="i"
      :x="g - 4"
      y="85"
      width="8"
      height="12"
      fill="red"
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
      stroke="currentColor"
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
      stroke="currentColor"
    />
    <text v-for="(g, i) in chartData.awayGoals" v-bind:key="i" :x="g" y="90" text-anchor="middle">
      &#x26BD;
    </text>
  </svg>
</template>
