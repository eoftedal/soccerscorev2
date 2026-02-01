<script setup lang="ts">
const props = defineProps<{ svgPlaceHolder?: boolean }>();
</script>
<template>
  <div class="column">
    <svg v-if="props.svgPlaceHolder"></svg>
    <slot name="header" />
    <div class="row">Goals</div>
    <div class="row">Shots</div>
    <div class="row">Shots %</div>
    <div class="row">Corners</div>
    <div class="row">Off-sides</div>
    <div class="row">Free kicks</div>
    <div class="row">Penalties</div>
    <div class="row">Possession</div>
    <div class="row">Poss.time</div>
    <div class="row">Recov.time</div>
    <div class="row">Touches</div>
    <div class="row">Pass %</div>
    <div class="row">Passes</div>
    <div class="row">3-strings</div>
    <div class="row">5-strings</div>
    <div class="row">7-strings</div>
    <div class="row">Longest string</div>
    <div class="row">Avg string</div>
    <div class="row">Yellow cards</div>
    <div class="row">Red cards</div>
  </div>
</template>
