<script lang="ts" setup>
import { reactive, ref } from "vue";
import { toPng } from "html-to-image";

const frame = ref<HTMLDivElement | null>(null);

const state = reactive({
  imageSrc: null as string | null,
  name: "",
  dl: "",
  title: "Stabæk Akademi 2012",
});

function toDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result?.toString() ?? "");
    reader.readAsDataURL(blob);
  });
}

// Function to handle file change
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    toDataURL(file).then((dataUrl) => {
      //state.imageSrc = "/soccerscorev2/stb_logo.svg";
      state.imageSrc = dataUrl ?? "";
    });
  }
};
function generateImage() {
  let count = 0;
  requestAnimationFrame(() => {
    if (frame.value == null) return;
    toPng(frame.value).then((dataUrl) => {
      console.log("data", dataUrl.length);
      state.dl = dataUrl;
    });
    if (count++ < 3) setTimeout(() => generateImage(), 500);
  });
}
</script>
<template>
  <input type="file" @change="onFileChange" />
  <input type="text" v-model="state.name" placeholder="Navn" />
  <input type="text" v-model="state.title" placeholder="Tittel" />
  <button @click="() => generateImage()">Generate image</button>
  {{ state.imageSrc?.slice(0, 40) }}
  <a v-if="state.dl" class="linkButton" :href="state.dl" type="image/png" download="image.png"
    >Download</a
  >
  <br />
  <img v-if="state.dl" :src="state.dl" alt="Generated image" width="100px" />
  <div class="frame" ref="frame">
    <div class="frame-inner">
      <div
        class="inner"
        v-if="state.imageSrc"
        :style="{ backgroundImage: `url('${state.imageSrc}')` }"
        alt="Uploaded Image"
      >
        <header>
          <div>{{ state.name || "Navn" }}</div>
        </header>
        <footer>
          <div>{{ state.title }}</div>
        </footer>
      </div>
    </div>
  </div>
</template>
<style scoped>
.frame {
  height: 1350px;
  width: 1012px;
  background: #003e80;
  padding: 100px;
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
  background: #dc9800;
  color: #fff;
  font-size: 4.5em;
  xtext-transform: uppercase;
  font-weight: bold;
  padding-left: 10px;
  padding-left: 10px;
  padding-bottom: 10px;
  height: 90px;
  xborder-top: 10px solid #dc9800;
  xborder-bottom: 10px solid #dc9800;
  clip-path: polygon(0 0, 100% 0, 100% 120px, 120px 120px);
}
header div {
  margin-top: -30px;
  margin-left: -30px;
  background: #003e80;
  padding-left: 120px;
  clip-path: polygon(4px 0, 100% 0, 100% 110px, 114px 110px);
}
:root {
  --clip-subtract: 10px;
}
footer {
  bottom: -40px;
  left: -10px;
  position: absolute;
  background: #dc9800;
  color: #fff;
  padding-right: 10px;
  padding-top: 10px;
  font-size: 3em;
  font-weight: bold;
  xborder-top: 10px solid #dc9800;
  xborder-right: 10px solid #dc9800;
  clip-path: polygon(
    0 0,
    calc(100% - 110px) 0,
    calc(100% - 40px) calc(110px - 40px),
    calc(100% - 55px) 100%,
    0 112px
  );
  height: 110px;
}
footer div {
  background-color: #003e80;
  padding-right: 120px;
  background-image: url("/stb_logo.svg");
  background-size: 1em auto;
  background-position: 0px center;
  background-repeat: no-repeat;
  padding-top: 20px;
  clip-path: polygon(0 0, calc(100% - 104px) 0, calc(100% - 4px) 100px, 0px 100px);
  padding-left: 70px;
  height: 100px;
}
</style>
