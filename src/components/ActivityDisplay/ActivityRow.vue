<script setup lang="ts">
import { computed } from "vue";
import type { MetricTrend } from "./matchMetrics";

const props = defineProps<{
  values: [number, number];
  percentage?: boolean;
  formatter?: (x: number) => string;
  invert?: boolean;
  /** Colors one team's value green/red for a change compared to another match */
  trend?: MetricTrend;
}>();

const first = computed(() => {
  const v = props.values[0] ?? 0;
  if (props.formatter) return props.formatter(v);
  return v;
});
const second = computed(() => {
  const v = props.values[1] ?? 0;
  if (props.formatter) return props.formatter(v);
  return v;
});
const homeTrend = computed(() => (props.trend?.team == "home" ? props.trend.change : undefined));
const awayTrend = computed(() => (props.trend?.team == "away" ? props.trend.change : undefined));
</script>
<template>
  <div :class="{ row: true, invert }">
    <span
      :class="[
        { positive: values[0] > (values[1] ?? 0), negative: values[1] > (values[0] ?? 0) },
        homeTrend,
      ]"
      >{{ first }}{{ props.percentage ? "%" : "" }}</span
    >
    <span
      :class="[
        { positive: values[1] > (values[0] ?? 0), negative: values[0] > (values[1] ?? 0) },
        awayTrend,
      ]"
      >{{ second }}{{ props.percentage ? "%" : "" }}</span
    >
  </div>
</template>
<style>
.positive {
  font-weight: bold;
}
.invert .positive {
  font-weight: normal;
}
.invert .negative {
  font-weight: bold;
}
.row .better {
  color: #2a9d3f;
}
.row .worse {
  color: #d64545;
}
</style>
