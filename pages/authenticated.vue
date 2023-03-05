<template>
    <div class="h-full w-full grid place-items-center bg-black border-2 rounded border-emerald-400">
        <div class="text-4xl flex flex-col items-center text-center">
            <h1 href="" class="text-fuchsia-400">
                Login Successful!
                <div class="text-fuchsia-800 text-xl">You may close this window at any time.</div>
            </h1>
            <span class="mt-2">🥳</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~~/store/SessionStore'
import { storeToRefs } from 'pinia'
const sessionStore = useSessionStore()
const { sessionId } = storeToRefs(sessionStore)

definePageMeta({
  layout: "no-render",
});


function parseHash(hash: string) {
    const hashParams = new URLSearchParams(hash.substring(1))
    const hashObject: any = {}
    for (const [key, value] of hashParams) {
        hashObject[key] = value
    }
    return hashObject
}
onBeforeMount(async () => {
    const route = useRoute()
    if (route.query.error) {
        throw new Error('Error Returned From Spotify')
    }
    const hash = parseHash(route.hash)
    if (hash.state !== sessionId.value || sessionId.value.length === 0) {
        throw new Error('Returned State Not Valid')
    }
    //post message to base url
    window.opener.postMessage({ authenticated: true, hash }, window.location.origin)
})


</script>
