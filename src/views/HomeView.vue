<script setup lang="ts">
import { useMatchStore } from '@/stores/matches';
import type { TeamName } from '@/types';
import { storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import ModalDialog from "../components/ModalDialog.vue";

const buildDate = import.meta.env.VITE_BUILD_DATE;

const matchStore = useMatchStore();
const { teams } = storeToRefs(matchStore);
const router = useRouter();

const state = reactive({
    showNewTeam: false,
    teamName: ""
});
function addTeam() {
    matchStore.newTeam((state.teamName || "Team") as TeamName);
    state.showNewTeam = false;
    state.teamName = "";
}

const newTeamModal = ref<InstanceType<typeof ModalDialog> | null>(null);
function openNewTeamDialog() {
    state.teamName = "";
    newTeamModal.value?.open();
}

function reload() {
  location.href = ".?" + new Date().getTime();
}

</script>
<template>
    <main>
        <h2>Teams</h2>
        <div v-for="t in teams" :key="t.id" @click="router.push({ name: 'team', params: { id: t.id }})">{{ t.name }}</div>
        <button @click="openNewTeamDialog()">Add team</button>
        <footer @click="reload()">Version: {{ buildDate }}</footer>
    </main>
    <ModalDialog
        ref="newTeamModal"
        @ok="addTeam"
        >
        <h2>Add team</h2>
    <input type="text" v-model="state.teamName" placeholder="Team name" />
  </ModalDialog>
</template>

<style scoped>
main {
  margin: 2em;
}
footer {
  margin-top: 2em;
  font-size: 80%;
  text-align: center;
}
</style>