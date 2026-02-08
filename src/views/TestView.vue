<script lang="ts" setup>
import StyledButton from "@/components/StyledButton.vue";
import { reactive } from "vue";

const state = reactive({
  orientationGranted: "",
  start: null as number | null,
  diff: 0,
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
  let compassHeading: number | undefined;

  // If available (iOS), use the dedicated compass heading
  if ("webkitCompassHeading" in event && event.webkitCompassHeading !== undefined) {
    compassHeading = event.webkitCompassHeading as number;
  }
  // Otherwise, if we have an absolute value, use alpha.
  else if (event.absolute === true && event.alpha !== null) {
    // Depending on the device, alpha may need conversion.
    // Here we assume alpha is measured relative to magnetic north.
    compassHeading = event.alpha;
  }

  if (compassHeading !== undefined) {
    if (state.start === null) {
      state.start = compassHeading;
    } else {
      state.diff = compassHeading - state.start;
    }
  }
}
</script>
<template>
  <StyledButton @click="go">Request orientation permission</StyledButton>
  <div>
    {{ state.orientationGranted }}
  </div>
  <div>
    {{ state.diff }}
  </div>
</template>
