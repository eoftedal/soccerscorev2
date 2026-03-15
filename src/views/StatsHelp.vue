<template>
  <div class="help-view">
    <header class="help-header">
      <h1>Explanation of Stats</h1>
      <button class="close-btn" @click="goHome" aria-label="Close help">✕</button>
    </header>
    <section class="help-section">
      <div class="stat-block">
        <div class="stat-name">Goals</div>
        <div class="stat-desc">The number of goals scored by each team.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Shots</div>
        <div class="stat-desc">The total number of shots taken by each team.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Shot accuracy</div>
        <div class="stat-desc">The percentage of shots that resulted in a goal.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Corners</div>
        <div class="stat-desc">The number of corner kicks awarded to each team.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Off-sides</div>
        <div class="stat-desc">The number of times a team was called offside.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Free kicks</div>
        <div class="stat-desc">The number of free kicks awarded to each team.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Penalties</div>
        <div class="stat-desc">The number of penalties awarded to each team.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Possession</div>
        <div class="stat-desc">
          The percentage of time that each team controlled the ball during the match. Time starts
          when the team gets control of the the ball. Out-of-play is not counted.
        </div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Possession time</div>
        <div class="stat-desc">The total time that each team had control of the ball.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Recovery time</div>
        <div class="stat-desc">
          The average time (in seconds) it took for a team to regain possession after losing it.
          Out-of-play is included.
        </div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Pass accuracy</div>
        <div class="stat-desc">
          The percentage of completed passes out of total attempted passes.
        </div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Passes</div>
        <div class="stat-desc">
          The total number of completed passes by each team. Calculated as a uninterrupted (no
          out-of-play or anything else) touch received when the team has possession.
        </div>
      </div>
      <div class="stat-block">
        <div class="stat-name">3/5/7-strings</div>
        <div class="stat-desc">
          Number of times the teams has 3/5/7 uninterrupted passes in a row.
        </div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Longest string</div>
        <div class="stat-desc">Most number of passes in a row.</div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Average string</div>
        <div class="stat-desc">
          Average number of passes the team has in a row when the have the ball.
        </div>
      </div>
      <div class="stat-block">
        <div class="stat-name">Yellow/Red Cards</div>
        <div class="stat-desc">
          The number of yellow and red cards given to players for fouls or misconduct.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
function goHome() {
  router.push({ name: "home" });
}
</script>

<style scoped>
.help-view {
  max-width: 480px;
  margin: 0 auto;
  padding: 1rem;
  font-size: 1.1rem;
  background: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}
.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.help-header h1 {
  font-size: 1.3rem;
  margin: 0;
  font-weight: bold;
}
.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #333;
  padding: 0 0.5rem;
}
.help-section {
  margin-bottom: 1.2rem;
}
.stat-block {
  margin-bottom: 1.1em;
}
.stat-name {
  font-size: 1.08em;
  font-weight: bold;
}
.stat-desc {
  color: #333;
  font-size: 1em;
}
.help-view {
  padding: 0.5rem;
  font-size: 1rem;
}
.close-btn {
  font-size: 1.5rem;
}
</style>
