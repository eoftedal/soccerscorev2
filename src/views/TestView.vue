<script lang="ts" setup>
import { reactive } from "vue";

const state = reactive({
  orientationGranted: "",
});

function go() {
  if (
    "requestPermission" in window.DeviceOrientationEvent &&
    typeof window.DeviceOrientationEvent.requestPermission === "function"
  ) {
    window.DeviceOrientationEvent.requestPermission()
      .then((permissionState: string) => {
        state.orientationGranted = permissionState;
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", () => {});
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener("deviceorientation", () => {});
  }
}
</script>
<template>
  <button @click="go">Request orientation permission</button>
  <div>
    {{ state.orientationGranted }}
  </div>
</template>
