<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import DateView from "../components/DateView.vue";
import { toPng } from "html-to-image";
import { useMatchStore } from "@/stores/matches";
import { type Match } from "@/types";
import GrassImage from "../assets/grass.png";
import {
  getMatchPassAcc,
  getMatchPasses,
  getMatchPossession,
  getMatchShots,
  getTotal,
  goalScorers,
} from "@/match";
import { msToTimeString, formatScoringTime } from "@/timeUtils";

const route = useRoute();

const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;

const { getMatch } = useMatchStore();

const state = reactive({
  match: getMatch(id) as Match,
  msg: "",
  hidePossession: false,
  hidePasses: false,
  grass: "",
});
const dataUrl = ref("");

const matchbg = ref(undefined as undefined | HTMLDivElement);

document.body.scrollTo(0, 0);

watch(
  () => state.hidePasses,
  () => download(),
);
watch(
  () => state.hidePossession,
  () => download(),
);

function download() {
  dataUrl.value = "";
  //if (state.data == "") return;
  console.log("Loading image...");
  document.body.scrollTo(0, 0);
  if (matchbg.value) {
    matchbg.value.style.backgroundImage = `url(${state.grass})`;
  }
  document.body.scrollTo(0, 0);
  requestAnimationFrame(() => {
    const node = document.querySelector("div.match") as HTMLElement;
    toPng(node)
      .then(function (data: string) {
        //if (!blob) return alert("error");
        //saveAs(blob, 'match.png')
        if (data.length < 500000) return setTimeout(() => download(), 500);
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

const homeGoalScorers = computed(() => (state.match ? goalScorers(state.match, "home") : []));
const awayGoalScorers = computed(() => (state.match ? goalScorers(state.match, "away") : []));

const possession = computed(() => (state.match ? getMatchPossession(state.match) : [0, 0, 0, 0]));

const passAcc = computed(() => (state.match ? getMatchPassAcc(state.match) : [0, 0]));

const passes = computed(() => (state.match ? getMatchPasses(state.match) : [0, 0]));

const imageTitle = computed(() => {
  return `image.png`;
});

fetch(GrassImage)
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
    //state.grass = URL.createObjectURL(blob);
    //download();
  });
</script>
<template>
  <main :class="{ home: state.match.homeTeam.includes('Stabæk') }">
    <button @click="state.hidePossession = !state.hidePossession">
      {{ state.hidePossession ? "Show possession" : "Hide possession" }}
    </button>
    <button @click="state.hidePasses = !state.hidePasses">
      {{ state.hidePasses ? "Show passes" : "Hide passes" }}
    </button>

    <div v-if="dataUrl == ''" class="loader">Forbereder... Vennligst vent</div>

    <div v-if="dataUrl != ''">
      <a v-if="dataUrl" class="linkButton" :href="dataUrl" :download="imageTitle" type="image/png"
        >Download image</a
      >
      <!--p>Hvis backgrunnsbildet mangler, trykk her: <button :style="{height: '2em'}" @click="download()">Prøv igjen</button>
      </p-->
      <!--p>{{ state.data.length }}</p-->
      <img :src="dataUrl" />
    </div>
    <div class="match" ref="matchbg" v-if="dataUrl == ''">
      <table>
        <tbody>
          <tr class="date">
            <td colspan="5"><DateView :time="dt.getTime()" /><br />{{ state.match.location }}</td>
          </tr>
          <tr class="teams">
            <td>{{ state.match.homeTeam }}</td>
            <td>{{ getTotal(state.match, "home", "goals") }}</td>
            <td>-</td>
            <td>{{ getTotal(state.match, "away", "goals") }}</td>
            <td>{{ state.match.awayTeam }}</td>
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
                        ) + "'",
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
                        ) + "'",
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
            <td colspan="3">Possession</td>
            <td>{{ possession[1].toFixed(1) }}%</td>
          </tr>
          <tr class="stat" v-if="!state.hidePossession">
            <td>{{ msToTimeString(possession[2]) }}</td>
            <td colspan="3">Poss. tid</td>
            <td>{{ msToTimeString(possession[3]) }}</td>
          </tr>
          <tr class="stat" v-if="!state.hidePasses">
            <td>{{ passAcc[0].toFixed(1) }}%</td>
            <td colspan="3">Pass.sikk.</td>
            <td>{{ passAcc[1].toFixed(1) }}%</td>
          </tr>
          <tr class="stat" v-if="!state.hidePasses">
            <td>{{ passes[0] }}</td>
            <td colspan="3">Pasninger</td>
            <td>{{ passes[1] }}</td>
          </tr>

          <tr class="stat">
            <td>{{ getMatchShots(state.match)[0] }}</td>
            <td colspan="3">Skudd</td>
            <td>{{ getMatchShots(state.match)[1] }}</td>
          </tr>

          <tr class="stat">
            <td>{{ getTotal(state.match, "home", "corners") }}</td>
            <td colspan="3">Hjørnespark</td>
            <td>{{ getTotal(state.match, "away", "corners") }}</td>
          </tr>
          <tr class="stat">
            <td>{{ getTotal(state.match, "home", "freekicks") }}</td>
            <td colspan="3">Frispark</td>
            <td>{{ getTotal(state.match, "away", "freekicks") }}</td>
          </tr>
          <tr class="stat">
            <td>{{ getTotal(state.match, "home", "penalties") }}</td>
            <td colspan="3">Straffe</td>
            <td>{{ getTotal(state.match, "away", "penalties") }}</td>
          </tr>

          <tr class="stat">
            <td>{{ getTotal(state.match, "home", "yellowCards") }}</td>
            <td colspan="3">Gule kort</td>
            <td>{{ getTotal(state.match, "away", "yellowCards") }}</td>
          </tr>
          <tr class="stat">
            <td>{{ getTotal(state.match, "home", "redCards") }}</td>
            <td colspan="3">Røde kort</td>
            <td>{{ getTotal(state.match, "away", "redCards") }}</td>
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

  width: 720px;
  height: 1280px;
  background: #000;
  padding: 1em;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  font-size: 30px;
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
  font-size: 130%;
  font-weight: bolder;
  height: 1.5em;
}
tr.teams td {
  border-bottom: 2px solid #fff;
  padding-bottom: 0.5em;
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
div.bars {
  width: 80%;
  margin: 0 auto;
  display: flex;
  xjustify-content: space-around;

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
</style>
