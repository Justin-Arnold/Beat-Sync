<template>
    <div class="h-full w-full flex flex-col items-center justify-around">
        <h1 class="neon-text glass text-6xl border-4 p-4 border-white rounded-xl">
            Beat Sync
        </h1>
        <Button @click="authenticate">
            Login With Spotify
        </Button>
    </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~~/store/SessionStore'
import { storeToRefs  } from 'pinia'

const config = useRuntimeConfig()
const sessionStore = useSessionStore()
const { authorizeUri } = storeToRefs(sessionStore)
const { setSessionExpiration, setAccessToken, sessionId, isSessionExpired, setSessionId } = sessionStore

function authenticate() {
    if(sessionId.length === 0) {
        setSessionId()
    }
    const newWindow = window.open(authorizeUri.value, '_blank', 'width=500,height=600')
    if(newWindow) {
        newWindow.focus()
    }
}
onBeforeMount(() => {
    if(sessionId && !isSessionExpired) {
        navigateTo('/player')
    }
    window.addEventListener('message', (event) => {
        if(event.data.authenticated === true) {
            setSessionExpiration(event.data.hash.expires_in)
            setAccessToken(event.data.hash.access_token)
            navigateTo('/player')
        }
    })
})
</script>

<style scoped>

.neon-text {
    @apply text-white;
    text-shadow:
        0 0 7px #fff,
        0 0 10px #fff,
        0 0 21px #fff,
        0 0 42px #bc13fe,
        0 0 82px #bc13fe,
        0 0 92px #bc13fe,
        0 0 102px #bc13fe,
        0 0 151px #bc13fe;
}

h1 {
    padding: 0.4em;
    box-shadow:
        0 0 .2rem #fff,
        0 0 .2rem #fff,
        0 0 2rem #bc13fe,
        0 0 0.8rem #bc13fe,
        0 0 2.8rem #bc13fe,
        inset 0 0 1.3rem #bc13fe;
}

</style>
