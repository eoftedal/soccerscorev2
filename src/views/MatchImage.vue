<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import DateView from "../components/DateView.vue";
import { toPng } from "html-to-image";
import { useMatchStore } from "@/stores/matches";
import { useLogos } from "@/composables/useLogos";
import { type Match } from "@/models/types";
import GrassImage2 from "../assets/grass.avif";
import {
  getMatchPassAcc,
  getMatchPasses,
  getMatchPossession,
  getMatchShots,
  getMatchTotalStat,
  getMatchGoalScorers,
  getPenaltyScore,
} from "@/models/match";
import { msToTimeString, formatScoringTime } from "@/timeUtils";

const route = useRoute();

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;

const { getMatch } = useMatchStore();
const { getLogoUrl } = useLogos();

const translations = {
  possession: { NO: "Possession", EN: "Possession" },
  possessionTime: { NO: "Poss. tid", EN: "Poss. time" },
  passAccuracy: { NO: "Pass.sikk.", EN: "Pass acc." },
  passes: { NO: "Pasninger", EN: "Passes" },
  shots: { NO: "Skudd", EN: "Shots" },
  corners: { NO: "Hjørnespark", EN: "Corners" },
  freekicks: { NO: "Frispark", EN: "Free kicks" },
  penalties: { NO: "Straffe", EN: "Penalty" },
  yellowCards: { NO: "Gule kort", EN: "Yellow cards" },
  redCards: { NO: "Røde kort", EN: "Red cards" },
  showPossession: { NO: "Vis poss.", EN: "Show poss." },
  hidePossession: { NO: "Skjul poss.", EN: "Hide poss." },
  showPasses: { NO: "Vis pasninger", EN: "Show passes" },
  hidePasses: { NO: "Skjul pasninger", EN: "Hide passes" },
  downloadImage: { NO: "Last ned bilde", EN: "Download image" },
  preparing: { NO: "Forbereder... Vennligst vent", EN: "Preparing... Please wait" },
};

const state = reactive({
  match: getMatch(id) as Match,
  msg: "",
  hidePossession: false,
  hidePasses: false,
  grass: "",
  lang: "NO" as "NO" | "EN",
});

const t = (key: keyof typeof translations) => translations[key][state.lang];
const dataUrl = ref("");
const counter = ref(0);

const matchbg = ref(undefined as undefined | HTMLDivElement);

document.body.scrollTo(0, 0);

watch(
  () => state.hidePasses,
  () => download(true),
);
watch(
  () => state.hidePossession,
  () => download(true),
);
watch(
  () => state.lang,
  () => download(true),
);

function toggleLanguage() {
  state.lang = state.lang === "NO" ? "EN" : "NO";
}

function download(restartCounter = false) {
  dataUrl.value = "";
  if (restartCounter) {
    counter.value = 0;
  } else {
    counter.value++;
  }
  //if (state.data == "") return;
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
        //if (!blob) return alert("error");
        //saveAs(blob, 'match.png')
        if (data.length < 1400000) return setTimeout(() => download(), 500);
        console.log(data.length, data.length < 1400000);
        dataUrl.value = data;
      })
      .catch(function (error: Error) {
        console.error("oops, something went wrong!", error);
      });
  });
}

const dt = computed(() => {
  return new Date(state.match.date + "T" + state.match.time + ":00.000Z");
});

const homeGoalScorers = computed(() =>
  state.match ? getMatchGoalScorers(state.match, "home") : [],
);
const awayGoalScorers = computed(() =>
  state.match ? getMatchGoalScorers(state.match, "away") : [],
);

const possession = computed(() => (state.match ? getMatchPossession(state.match) : [0, 0, 0, 0]));

const passAcc = computed(() => (state.match ? getMatchPassAcc(state.match) : [0, 0]));

const passes = computed(() => (state.match ? getMatchPasses(state.match) : [0, 0]));

const homeLogo = computed(() => getLogoUrl(state.match.homeLogo));
const awayLogo = computed(() => getLogoUrl(state.match.awayLogo));
const showLogos = computed(() => homeLogo.value && awayLogo.value);

const imageTitle = computed(() => {
  return `image.png`;
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
  <main :class="{ home: state.match.homeTeam.includes('Stabæk') }">
    <div class="buttonRow">
      <button @click="state.hidePossession = !state.hidePossession">
        {{ state.hidePossession ? t("showPossession") : t("hidePossession") }}
      </button>
      <button @click="state.hidePasses = !state.hidePasses">
        {{ state.hidePasses ? t("showPasses") : t("hidePasses") }}
      </button>
      <button @click="toggleLanguage">
        {{ state.lang === "NO" ? "EN" : "NO" }}
      </button>

      <a
        :class="{ linkButton: true, disabled: dataUrl == '' }"
        :href="dataUrl"
        :download="imageTitle"
        type="image/png"
        >{{ t("downloadImage") }}</a
      >
    </div>
    <div v-if="dataUrl != ''">
      {{ ((dataUrl.length * 3) / 4 / (1024 * 1024)).toFixed(1) }} MB
      {{ ((state.grass.length * 3) / 4 / (1024 * 1024)).toFixed(1) }} MB {{ counter }}
      <!--p>Hvis backgrunnsbildet mangler, trykk her: <button :style="{height: '2em'}" @click="download()">Prøv igjen</button>
      </p-->
      <!--p>{{ state.data.length }}</p-->
      <img :src="dataUrl" alt="image" />
    </div>
    <div v-if="dataUrl == ''" class="loader">{{ t("preparing") }}</div>
    <div class="match" ref="matchbg" v-if="dataUrl == ''">
      <table>
        <tbody>
          <tr class="date">
            <td colspan="5"><DateView :time="dt.getTime()" /><br />{{ state.match.location }}</td>
          </tr>
          <tr
            :class="{ teams: true, hasPenalties: state.match.penaltyRound, withLogos: showLogos }"
          >
            <td class="team">
              <div>
                <img :src="homeLogo" alt="Home logo" class="team-logo" v-if="showLogos" />
                <span>{{ state.match.homeTeam }}</span>
              </div>
            </td>
            <td>{{ getMatchTotalStat(state.match, "home", "goals") }}</td>
            <td>-</td>
            <td>{{ getMatchTotalStat(state.match, "away", "goals") }}</td>
            <td class="team">
              <div>
                <img :src="awayLogo" alt="Away logo" class="team-logo" v-if="showLogos" />
                <span>{{ state.match.awayTeam }}</span>
              </div>
            </td>
          </tr>
          <tr v-if="state.match.penaltyRound" class="penalties">
            <td colspan="5">Pen {{ getPenaltyScore(state.match)?.join("-") }}</td>
          </tr>
          <tr class="scorers">
            <td colspan="2">
              <div v-for="[n, times] in homeGoalScorers" v-bind:key="n">
                {{ n }}
                {{
                  times
                    .map(
                      (x) =>
                        formatScoringTime(
                          x[0],
                          x[1],
                          state.match.periodLength,
                          state.match.extraPeriodLength,
                        ) +
                        "'" +
                        x[2],
                    )
                    .join(", ")
                }}
              </div>
            </td>
            <td colspan="1"></td>
            <td colspan="2">
              <div v-for="[n, times] in awayGoalScorers" v-bind:key="n">
                {{ n }}
                {{
                  times
                    .map(
                      (x) =>
                        formatScoringTime(
                          x[0],
                          x[1],
                          state.match.periodLength,
                          state.match.extraPeriodLength,
                        ) +
                        "'" +
                        x[2],
                    )
                    .join(", ")
                }}
              </div>
            </td>
          </tr>
          <tr v-if="!state.hidePossession">
            <td colspan="5" class="bars">
              <div class="bars">
                <div :style="{ width: possession[0] + '%' }"></div>
                <div :style="{ width: possession[1] + '%' }"></div>
              </div>
            </td>
          </tr>
          <tr class="stat" v-if="!state.hidePossession">
            <td>{{ possession[0].toFixed(1) }}%</td>
            <td colspan="3">{{ t("possession") }}</td>
            <td>{{ possession[1].toFixed(1) }}%</td>
          </tr>
          <tr class="stat" v-if="!state.hidePossession">
            <td>{{ msToTimeString(possession[2]) }}</td>
            <td colspan="3">{{ t("possessionTime") }}</td>
            <td>{{ msToTimeString(possession[3]) }}</td>
          </tr>
          <tr class="stat" v-if="!state.hidePasses">
            <td>{{ passAcc[0].toFixed(1) }}%</td>
            <td colspan="3">{{ t("passAccuracy") }}</td>
            <td>{{ passAcc[1].toFixed(1) }}%</td>
          </tr>
          <tr class="stat" v-if="!state.hidePasses">
            <td>{{ passes[0] }}</td>
            <td colspan="3">{{ t("passes") }}</td>
            <td>{{ passes[1] }}</td>
          </tr>

          <tr class="stat">
            <td>{{ getMatchShots(state.match)[0] }}</td>
            <td colspan="3">{{ t("shots") }}</td>
            <td>{{ getMatchShots(state.match)[1] }}</td>
          </tr>

          <tr class="stat">
            <td>{{ getMatchTotalStat(state.match, "home", "corners") }}</td>
            <td colspan="3">{{ t("corners") }}</td>
            <td>{{ getMatchTotalStat(state.match, "away", "corners") }}</td>
          </tr>
          <tr class="stat">
            <td>{{ getMatchTotalStat(state.match, "home", "freekicks") }}</td>
            <td colspan="3">{{ t("freekicks") }}</td>
            <td>{{ getMatchTotalStat(state.match, "away", "freekicks") }}</td>
          </tr>
          <tr class="stat">
            <td>{{ getMatchTotalStat(state.match, "home", "penalties") }}</td>
            <td colspan="3">{{ t("penalties") }}</td>
            <td>{{ getMatchTotalStat(state.match, "away", "penalties") }}</td>
          </tr>

          <tr class="stat cards">
            <td>
              <div
                class="card yellow"
                v-for="x in getMatchTotalStat(state.match, 'home', 'yellowCards')"
                v-bind:key="x"
              ></div>
              <div v-if="getMatchTotalStat(state.match, 'home', 'yellowCards') == 0">-</div>
            </td>
            <td colspan="3">{{ t("yellowCards") }}</td>
            <td>
              <div
                class="card yellow"
                v-for="x in getMatchTotalStat(state.match, 'away', 'yellowCards')"
                v-bind:key="x"
              ></div>
              <div v-if="getMatchTotalStat(state.match, 'away', 'yellowCards') == 0">-</div>
            </td>
          </tr>
          <tr class="stat cards">
            <td>
              <div
                class="card red"
                v-for="x in getMatchTotalStat(state.match, 'home', 'redCards')"
                v-bind:key="x"
              ></div>
              <div v-if="getMatchTotalStat(state.match, 'home', 'redCards') == 0">-</div>
            </td>
            <td colspan="3">{{ t("redCards") }}</td>
            <td>
              <div
                class="card red"
                v-for="x in getMatchTotalStat(state.match, 'away', 'redCards')"
                v-bind:key="x"
              ></div>
              <div v-if="getMatchTotalStat(state.match, 'away', 'redCards') == 0">-</div>
            </td>
          </tr>

          <tr class="filler">
            <td colspan="5"></td>
          </tr>
        </tbody>
      </table>
    </div>
    {{ state.msg }}
  </main>
</template>
<style scoped>
.match {
  display: flex;
  flex-direction: column;
  align-items: center;
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

table {
  width: 100%;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  height: 100%;
  border-collapse: collapse;
}

tr:nth-child(3) td {
  padding-top: 1em;
}

tr.teams {
  font-size: 120%;
  font-weight: bolder;
  height: 1.5em;
}
tr.teams td {
  padding-bottom: 0.5em;
}

tr.teams td.team div {
  width: 100%;
  display: flex;
  flex-direction: column;
}

tr.teams td.team .team-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

tr.teams.withLogos td.team div {
  align-items: center;
  text-align: center;
}
tr.teams.withLogos td.team div span {
  width: 100%;
  font-size: 80%;
}

tr.teams.hasPenalties td {
  padding-bottom: 0em;
}

tr.penalties td {
  text-align: center;
  font-size: 90%;
  padding: 0em 0em 0.5em 0em;
}
tr.scorers td {
  border-top: 2px solid #fff;
}

tr.teams :nth-child(2),
tr.teams :nth-child(4) {
  width: 2em;
}
tr.teams > td:first-child {
  border-left: 0.5em solid transparent;
}
tr.teams > td:last-child {
  border-right: 0.5em solid transparent;
}
td:nth-child(1),
td:nth-child(2) {
  text-align: right;
}
td:nth-child(3) {
  width: 1em;
  text-align: center;
}
tr.date td {
  text-align: center;
  height: 5em;
  padding-top: 3em;
  padding-bottom: 2em;
}

td:nth-child(1),
td:nth-child(5) {
  width: 35%;
}
tr.stat td:nth-child(2) {
  text-align: center;
}
tr.stat td:nth-child(1) {
  text-align: right;
}
tr.stat td:nth-child(3) {
  text-align: left;
}
tr.stat {
  height: 1.5em;
  font-weight: bold;
}
tr.scorers {
  font-size: 70%;
}
tr.scorers td {
  padding-bottom: 2em;
  vertical-align: top;
}
tr.scorers td:first-of-type {
  padding-right: 2em;
  text-align: right;
}
tr.scorers td:last-of-type {
  padding-left: 2em;
  text-align: left;
}
tr.filler {
  height: 100%;
}
.loader {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 2em;
}
img {
  width: 100%;
}
td.bars {
  width: 100%;
}
div.baran {
  width: 80%;
  margin: 0 auto;
  position: relative;
  * > div {
    border-radius: 0.5em;
    padding: 0 0.5em;
    width: 100%;
    background: white;
    display: flex;
    justify-content: space-between;
    color: #000;
    &.dark {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      background: rgb(0, 102, 255);
      color: #fff;
    }
  }
}

div.bars {
  width: 80%;
  margin: 0 auto;
  display: flex;

  div {
    height: 0.5em;
    background: #fff;
    border-top-left-radius: 0.5em;
    border-bottom-left-radius: 0.5em;
    margin-right: 4px;
    color: #000;
    text-align: left;
  }
  div:nth-child(2) {
    background: rgb(0, 102, 255);
    border-top-right-radius: 0.5em;
    border-bottom-right-radius: 0.5em;
    border-top-left-radius: 0em;
    border-bottom-left-radius: 0em;
    color: #fff;
    text-align: right;
  }
}
.home div.bars {
  div {
    background: rgb(0, 102, 255);
  }
  div:nth-child(2) {
    background: #fff;
  }
}
.card {
  display: inline-block;
  width: 0.75em;
  height: 1.2em;
  &.red {
    background: red;
  }
  &.yellow {
    background: yellow;
  }
}
.cards td:has(.card) {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  .card {
    margin-left: 0px;
    margin-right: 4px;
  }

  &:first-child {
    justify-content: end;
    .card {
      margin-left: 4px;
      margin-right: 0px;
    }
  }
}
</style>
