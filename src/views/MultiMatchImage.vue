<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { toPng } from "html-to-image";
import { useMatchStore } from "@/stores/matches";
import { useLogos } from "@/composables/useLogos";
import { type Match } from "@/models/types";
import GrassImage2 from "../assets/grass.avif";
import { getGoals } from "@/models/match";

const route = useRoute();

const matchIds = computed(() => {
  const matchesQuery = route.query.matches as string;
  return matchesQuery ? matchesQuery.split(',') : [];
});

const { getMatch } = useMatchStore();
const { getLogoUrl } = useLogos();

const state = reactive({
  grass: "",
});

const matches = computed(() => {
  return matchIds.value
    .map(id => getMatch(id))
    .filter((m): m is Match => m !== undefined);
});

const dataUrl = ref("");
const counter = ref(0);
const matchbg = ref(undefined as undefined | HTMLDivElement);

document.body.scrollTo(0, 0);

function download(restartCounter = false) {
  dataUrl.value = "";
  if (restartCounter) {
    counter.value = 0;
  } else {
    counter.value++;
  }
  console.log("Loading image...");
  document.body.scrollTo(0, 0);
  if (matchbg.value) {
    matchbg.value.style.backgroundImage = `url(${state.grass})`;
  }
  document.body.scrollTo(0, 0);
  requestAnimationFrame(() => {
    const node = document.querySelector("div.match") as HTMLElement;
    toPng(node, {
      canvasHeight: 1920,
      canvasWidth: 1080,
      height: 1920,
      width: 1080,
      cacheBust: true,
      pixelRatio: 2,
    })
      .then(function (data: string) {
        if (data.length < 1400000) return setTimeout(() => download(), 500);
        console.log(data.length, data.length < 1400000);
        dataUrl.value = data;
      })
      .catch(function (error: Error) {
        console.error("oops, something went wrong!", error);
      });
  });
}

function getHomeLogo(match: Match) {
  return getLogoUrl(match.homeLogo);
}

function getAwayLogo(match: Match) {
  return getLogoUrl(match.awayLogo);
}

function getScore(match: Match) {
  return getGoals(match, "home") + " - " + getGoals(match, "away");
}

const imageTitle = computed(() => {
  return `matches.png`;
});

fetch(GrassImage2)
  .then((response) => response.blob())
  .then((blob) => {
    console.log(blob.type, "reading blob...");
    const reader = new FileReader();
    reader.onload = function () {
      console.log("Data URL created");
      state.grass = reader.result as string;
      requestAnimationFrame(() => download());
    };
    reader.readAsDataURL(blob);
  });
</script>
<template>
  <main>
    <div class="buttonRow">
      <a
        :class="{ linkButton: true, disabled: dataUrl == '' }"
        :href="dataUrl"
        :download="imageTitle"
        type="image/png"
        >Download image</a
      >
    </div>
    <div v-if="dataUrl != ''">
      {{ ((dataUrl.length * 3) / 4 / (1024 * 1024)).toFixed(1) }} MB
      {{ ((state.grass.length * 3) / 4 / (1024 * 1024)).toFixed(1) }} MB {{ counter }}
      <img :src="dataUrl" alt="image" class="image" />
    </div>
    <div v-if="dataUrl == ''" class="loader">Preparing... Please wait</div>
    <div class="match" ref="matchbg" v-if="dataUrl == '' || true">
      <div class="content">
        <div class="matchRow" v-for="m in matches" :key="m.id">
          <div class="team home">
            <div class="logo">
              <img v-if="getHomeLogo(m)" :src="getHomeLogo(m)" alt="Home logo" />
              <div v-else class="placeholder-crest"></div>
            </div>
            <div class="name">{{ m.homeTeam }}</div>
          </div>
          <div class="score">{{ getScore(m) }}</div>
          <div class="team away">
            <div class="logo">
              <img v-if="getAwayLogo(m)" :src="getAwayLogo(m)" alt="Away logo" />
              <div v-else class="placeholder-crest"></div>
            </div>
            <div class="name">{{ m.awayTeam }}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.match {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  width: 1080px;
  height: 1920px;
  background: #000;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  font-size: 40px;
}

.buttonRow {
  display: flex;
  max-height: 3em;
  justify-content: space-between;
}
.buttonRow > * {
  flex-grow: 0;
  flex-shrink: 0;
  display: inline-block;
}
.image {
    display: block;
    width: 100px;
}

.content {
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  height: 100%;
  padding-top: 200px;
}

.matchRow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #fff;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
}


.logo {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-crest {
  width: 80px;
  height: 100px;
  background: #666;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.name {
  font-size: 32px;
  margin-top: 8px;
  text-align: center;
  max-width: 100%;
  
  
}
/*
.team.home .name {
  text-align: right;
}

.team.away .name {
  text-align: left;
}
*/
.score {
  font-size: 60px;
  font-weight: bold;
  min-width: 180px;
  text-align: center;
}

.loader {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 2em;
  color: #fff;
}


.linkButton {
  display: inline-block;
  padding: 0.5em 1em;
  border-radius: 4px;
  text-decoration: none;
}

.linkButton.disabled {
  opacity: 0.5;
  background: var(--color-background-mute);
  pointer-events: none;
  color: var(--color-text);
}
</style>
