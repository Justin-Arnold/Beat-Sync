<template>
    <Button @click="logout('/')" class="fixed top-4 right-4 z-[999]">Logout</Button>
    <Drawer anchor="left">
        <div class="card w-[400px] flex flex-col items-center">
            <CurrentlyPlaying></CurrentlyPlaying>
            <div class="text-white py-2 my-2 rounded-xl overflow-auto scrollbar-none whitespace-nowrap bg-neutral-300">
                <span v-for="each, index in playlists" :key="index" class="mx-1" @click="playNewPlaylist(each.id)">
                    <img :src="each.images[0].url" class="rounded-lg h-28 aspect-square inline-block hover:scale-110 hover:cursor-pointer transition duration-300"/>
                </span>
            </div>
        </div>
    </Drawer>
    <Drawer anchor="bottom">
        <AnimationControls></AnimationControls>
    </Drawer>
</template>
<script setup lang="ts">
import { useSessionStore } from '~~/store/SessionStore'
import { usePlayerStore } from '~~/store/PlayerStore'
import { storeToRefs } from 'pinia'
import WebPlayer from '../classes/webPlayer'
import { service as spotifyService } from '../util/spotifyService'
import { Playlist } from 'spotify-types'

const sessionStore = useSessionStore()
const { accessToken, isSessionExpired } = storeToRefs(sessionStore)
const { logout } = sessionStore

const playerStore = usePlayerStore()
const { currentProgress, currentlyPlaying, speedBottom, speedTop, player } = storeToRefs(playerStore)

const playlists: Ref<Playlist[]> = ref([])


const showMenu = ref(false)
const isPlaying = ref(false)


async function playNewPlaylist(playlistId: string) {
    if (isSessionExpired.value) {
        logout('/')
    }
    if (!player.value?.id) {
        return
    }
    await spotifyService.playPlaylist(accessToken.value, player.value.id, playlistId)
    player.value.resume()
    isPlaying.value = true

}

onBeforeMount(() => {
    player.value = new WebPlayer(accessToken.value, {
        ready: () => {
            console.log('ready')
            spotifyService.getFeaturedPlaylists(accessToken.value)
            .then((response) => {
                playlists.value = response.playlists.items
            })
        }
    })
})

onBeforeUnmount(() => {
    if(!player.value) return
    player.value.destroy()
})
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
    display: none;
}
</style>