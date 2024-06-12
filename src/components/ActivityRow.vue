<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  values: [number, number];
  percentage?: boolean;
  formatter?: (x: number) => string;
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
</script>
<template>
  <div class="row">
    <span
      :class="{ positive: values[0] > (values[1] ?? 0), negative: values[1] > (values[0] ?? 0) }"
      >{{ first }}{{ props.percentage ? "%" : "" }}</span
    >
    <span
      :class="{ positive: values[1] > (values[0] ?? 0), negative: values[0] > (values[1] ?? 0) }"
      >{{ second }}{{ props.percentage ? "%" : "" }}</span
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
