<script setup lang="ts">
import { reactive } from "vue";
import { type PenaltyRound, type GoalScorer } from "../types";

const props = defineProps<{
    penaltyRound: PenaltyRound;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const state = reactive({
    penaltyRound: props.penaltyRound
});

</script>

<template>
    <div class="top">
        Starting team:
        <select v-model="state.penaltyRound.start">
            <option value="home">Home</option>
            <option value="away">Away</option>
        </select>
    </div>
    <div v-for="(row,i) in state.penaltyRound.events" v-bind:key="i" :class="{penaltyRow: true, startAway: state.penaltyRound.start == 'away' }">
        <div>
            <div class="row">
                <input type="checkbox" v-model="row[0][0]">
                <input type="text"  v-model="row[0][1]" placeholder="Name">
            </div>
            <div class="row">
                <input type="text"  v-model="row[1][1]" placeholder="Name">
                <input type="checkbox" v-model="row[1][0]">
            </div>
        </div>
    </div>
    <div class="toolbar">
        <button @click="state.penaltyRound.events.push([[false, '' as GoalScorer], [false, '' as GoalScorer]])">Add row</button>
        <button @click="state.penaltyRound.events.pop()">Remove last row</button>
        <button @click="emit('close')">Close</button>
    </div>
</template>

<style scoped>
input[type='checkbox'] {
    height: 2em;
    width: 2em;
    margin-right: 5px;
    margin-left: 5px;
}
.top {
    margin-bottom: 1em;
    text-align: center;
}
.toolbar {
    margin-top: 1em;
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.penaltyRow div div {
    display: flex;
    width: 100%;
}
.penaltyRow div:nth-child(2) {
    justify-content: right;
    order: 2;
}

.penaltyRow {
    display: grid;
    grid-template-columns: 1fr auto;
}

.penaltyRow > div {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 0.5em;
}

.penaltyRow div.row:nth-child(1) {
    justify-content: left;
    order: 1;
}

.penaltyRow.startAway div.row:nth-child(1) {
    order: 3;
}

</style>