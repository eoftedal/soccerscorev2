<template>
  <div class="help-view">
    <header class="help-header">
      <h1>How to Register Match Events</h1>
      <button class="close-btn" @click="goHome" aria-label="Close help">✕</button>
    </header>
    <section class="help-section">
      <h2>Registering a Touch</h2>
      <ul>
        <li>
          Tap the large team button when a player receives a pass or gets the ball from an opponent.
        </li>
        <li>This starts a new possession and is the main way to track play.</li>
        <li>
          To resume play after out-of-play, register a touch <strong>only if</strong> you used the
          out-of-play button. Do not click this if play is resumed from holding a button.
        </li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Registering a Corner, Freekick, or Penalty</h2>
      <ul>
        <li>Use the corner, freekick, or penalty buttons for the team taking the set piece.</li>
        <li>
          You can either:
          <ul>
            <li>
              Hold the button to indicate the ball is out of play (e.g., before the kick is taken),
              then release the button when play resumes.
            </li>
            <li>
              Or, use the out-of-play button instead of holding &mdash; in this case, you tap the
              corresponding button when play resumes.
            </li>
          </ul>
        </li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Registering a Goal</h2>
      <ul>
        <li>Tap the goal button when a goal is scored.</li>
        <li>A dialog will appear to select the scorer and assister.</li>
        <li>Registering a goal automatically puts the game out of play.</li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Registering an Offside</h2>
      <ul>
        <li>Tap the offside button when an offside occurs.</li>
        <li>This also puts the game out of play automatically.</li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Registering a red card, or yellow card</h2>
      <ul>
        <li>Tap the corresponding button for the team</li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Registering a shot</h2>
      <ul>
        <li>Tap the corresponding button for the team</li>
        <li>Remember to to also register a touch, if it's a direct shot.</li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Registering a Throw-in</h2>
      <ul>
        <li>There is no dedicated throw-in button.</li>
        <li>
          To register a throw-in:
          <ul>
            <li>
              Hold the touch button for the team to indicate out-of-play. When the throw-in is
              taken, simply release the button.
            </li>
            <li>
              Or, use the out-of-play button, then tap the touch button for the team taking the
              throw-in.
            </li>
          </ul>
        </li>
      </ul>
    </section>
    <section class="help-section">
      <h2>Out of Play</h2>
      <ul>
        <li>Click the out-of-play button to mark the ball as out-of-play</li>
        <li>
          Alternatively for the touch, corner, freekick, or penalty buttons can mark the ball as
          out-of-play by holding the button.
        </li>
        <li>Goals and offsides automatically set the game to out of play.</li>
      </ul>
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
.help-section h2 {
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  font-weight: bold;
}
ul {
  padding-left: 1.2em;
}
li {
  margin-bottom: 0.4em;
}
.help-view {
  padding: 0.5rem;
  font-size: 1rem;
}
.close-btn {
  font-size: 1.5rem;
}
</style>
