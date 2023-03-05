<template>
    <div class="aspect-square rounded-lg mb-2 w-full">
        <div v-if="hasCurrentlyPlayingImage" class="p-2 bg-neutral-300">
            <nuxt-img :src="currentlyPlaying?.item?.album.images[0].url" class=""/>
        </div>
        <div v-else class="h-full w-full bg-neutral-300 grid place-items-center">
            <Icon icon="ic:round-music-off" class="text-6xl text-neutral-900"/>
        </div>
    </div>
    <PlayerControls></PlayerControls>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~~/store/PlayerStore'
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue';
import { CurrentlyPlayingContext, Track} from 'spotify-types';

const playerStore = usePlayerStore()
const { currentlyPlaying } = storeToRefs(playerStore)

const hasCurrentlyPlayingImage = computed(() => {
    return !!currentlyPlaying.value?.item?.album.images[0].url
})
</script>