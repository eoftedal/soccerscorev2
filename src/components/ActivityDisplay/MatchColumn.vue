<script setup lang="ts">
import { type Match } from "@/models/types";
import ActivityRow from "./ActivityRow.vue";
import { matchMetrics, type MatchMetric, type MetricTrend } from "./matchMetrics";

const props = defineProps<{
  match: Match;
  svgPlaceHolder?: boolean;
  /** Per-metric change compared to another match, used to color one team's values */
  trend?: Partial<Record<MatchMetric, MetricTrend>>;
}>();
</script>
<template>
  <div class="column">
    <svg height="100" width="100" v-if="props.svgPlaceHolder"></svg>
    <slot name="header" />
    <ActivityRow
      v-for="metric in matchMetrics"
      :key="metric.key"
      :values="metric.values(props.match)"
      :formatter="metric.formatter"
      :percentage="metric.percentage"
      :invert="metric.invert"
      :trend="props.trend?.[metric.key]"
    />
  </div>
</template>
