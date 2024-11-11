<script lang="ts" setup>
import { reactive, ref } from "vue";
import { toPng } from "html-to-image";

const frame = ref(null);

const state = reactive({
  imageSrc: null as string | null,
  name: "",
  dl: "",
});

// Function to handle file change
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    state.imageSrc = URL.createObjectURL(file); // Create a local URL for the file
  }
};
function generateImage() {
  if (frame.value == null) return;
  toPng(frame.value).then((dataUrl) => {
    state.dl = dataUrl;
  });
}
</script>
<template>
  <input type="file" @change="onFileChange" />
  <input type="text" v-model="state.name" placeholder="Navn" />
  <button @click="() => generateImage()">Generate image</button>
  {{ state.imageSrc }}
  <a v-if="state.dl" class="linkButton" :href="state.dl" download="image.png">Download</a>
  <div class="frame" ref="frame">
    <div class="frame-inner">
      <div
        class="inner"
        v-if="state.imageSrc"
        :style="{ backgroundImage: `url(${state.imageSrc})` }"
        alt="Uploaded Image"
      >
        <header>{{ state.name || "Navn" }}</header>
        <footer>Stabæk Akademi 2012</footer>
      </div>
    </div>
  </div>
</template>
<style scoped>
.frame {
  height: 1350px;
  width: 1080px;
  background: #003e80;
  padding: 50px;
}
.frame-inner {
  height: 100%;
  width: 100%;
  border: 10px solid #dc9800;
}
.inner {
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}
header {
  top: -10px;
  right: -10px;
  position: absolute;
  background: #003e80;
  color: #fff;
  font-size: 5em;
  font-weight: bold;
  padding-left: 1em;
  padding-right: 1em;
  padding-top: 0.2em;
  border-left: 10px solid #dc9800;
  border-bottom: 10px solid #dc9800;
}
footer {
  bottom: -10px;
  left: -10px;
  position: absolute;
  background: #003e80;
  color: #fff;
  background-image: url("/stb_logo.svg");
  background-size: 1em auto;
  background-position: 20px center;
  background-repeat: no-repeat;
  font-size: 3em;
  font-weight: bold;
  padding-left: 80px;
  padding-right: 0.5em;
  padding-top: 0.2em;
  border-top: 10px solid #dc9800;
  border-right: 10px solid #dc9800;
}
</style>
