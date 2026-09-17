<script setup lang="ts">
import { matchMetrics } from "./matchMetrics";

const props = defineProps<{ svgPlaceHolder?: boolean }>();
</script>
<template>
  <div class="column">
    <svg v-if="props.svgPlaceHolder"></svg>
    <slot name="header" />
    <div class="row" v-for="metric in matchMetrics" :key="metric.key">{{ metric.label }}</div>
  </div>
</template>
