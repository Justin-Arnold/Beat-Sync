<template>
    <div class="flex justify-center align-middle">
        <Button class="mr-4 !rounded-full !px-2" @click="togglePlayerIsPlaying">
            <Icon :icon="isPlaying ? 'ic:round-pause': 'material-symbols:play-arrow-rounded'" class="text-3xl"></Icon>
        </Button>
        <Button @click="goToNextTrack">Skip</Button>
    </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from '~~/store/PlayerStore';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';

const playerStore = usePlayerStore()
const { isPlaying } = storeToRefs(playerStore)
const { togglePlayerIsPlaying, goToNextTrack } = playerStore

</script>

