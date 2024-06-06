<script setup lang="ts">
const props = defineProps<{
  values: [number, number];
  percentage?: boolean;
}>();
</script>
<template>
  <div class="row">
    <span :class="{ positive: values[0] > values[1], negative: values[1] > values[0] }"
      >{{ props.values[0] ?? 0 }}{{ props.percentage ? "%" : "" }}</span
    >
    <span :class="{ positive: values[1] > values[0], negative: values[0] > values[1] }"
      >{{ props.values[1] ?? 0 }}{{ props.percentage ? "%" : "" }}</span
    >
  </div>
</template>
<style>
.negative {
  xbackground-color: #ddf;
}
.positive {
  xbackground-color: #dfd;
  font-weight: bold;
}
</style>
