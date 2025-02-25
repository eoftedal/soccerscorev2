<script lang="ts" setup>
import { reactive, ref } from "vue";
import { toPng } from "html-to-image";

const frame = ref<HTMLDivElement | null>(null);

const state = reactive({
  imageSrc: null as string | null,
  name: "",
  title: "Stabæk Akademi 2012",
});
const downloadableImage = ref<string | null>(null);
const count = ref(0);

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
function generateImage(ix = 1) {
  count.value = ix;
  requestAnimationFrame(() => {
    if (frame.value == null) return;
    toPng(frame.value).then((dataUrl) => {
      console.log("data", dataUrl.length);
      if (dataUrl.length < (state.imageSrc?.length ?? 1) * 0.8) {
        console.log("Image too small, retrying");
        generateImage(ix + 1);
        return;
      }
      downloadableImage.value = dataUrl;
    });
    //if (count++ < 3) setTimeout(() => generateImage(), 500);
  });
}
</script>
<template>
  <input type="file" @change="onFileChange" />
  <input type="text" v-model="state.name" placeholder="Navn" />
  <input type="text" v-model="state.title" placeholder="Tittel" />
  <button @click="() => generateImage()">Generate image</button>
  <div v-if="state.imageSrc">
    {{ ((state.imageSrc?.length ?? 0) / (1024 * 1024)).toFixed(1) }}MB
    <span v-if="downloadableImage"
      >{{ ((downloadableImage?.length ?? 0) / (1024 * 1024)).toFixed(1) }}MB {{ count }}</span
    >
  </div>
  <a
    v-if="downloadableImage"
    class="linkButton"
    :href="downloadableImage"
    type="image/png"
    download="image.png"
    >Download</a
  >
  <br />
  <img v-if="downloadableImage" :src="downloadableImage" alt="Generated image" width="100px" />
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
  background-position: center center;
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
