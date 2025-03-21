<script lang="ts" setup>
import { reactive } from "vue";

const state = reactive({
  orientationGranted: "",
  startGamma: null as number | null,
  gammaDiff: 0,
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
          window.addEventListener("deviceorientation", handlOrientation);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener("deviceorientation", handlOrientation);
  }
}
function handlOrientation(event: DeviceOrientationEvent) {
  if (event.gamma === null) return;
  if (state.startGamma == null) {
    state.startGamma = event.gamma;
    return;
  }
  state.gammaDiff = event.gamma - state.startGamma;
  console.log(diff);
}
</script>
<template>
  <button @click="go">Request orientation permission</button>
  <div>
    {{ state.orientationGranted }}
  </div>
  <div>
    {{ state.gammaDiff }}
  </div>
</template>
