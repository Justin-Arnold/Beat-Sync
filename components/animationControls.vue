<script setup lang="ts">
import { usePlayerStore } from '~~/store/PlayerStore';
import { storeToRefs } from 'pinia';
const playerStore = usePlayerStore()
const { speedBottom, speedTop} = storeToRefs(playerStore)

function adjustIntensity(intensity: string) {
    switch (intensity) {
        case 'Low':
            speedBottom.value = speedTop.value * 0.5
            break
        case 'Medium':
            speedBottom.value = speedTop.value * 0.75
            break
        case 'High':
            speedBottom.value = speedTop.value * 0.99
            break
    }
}

function adjustBrightness(brightness: string) {
    switch (brightness) {
        case 'Low':
            speedTop.value = 50
            break
        case 'Medium':
            speedTop.value = 150
            break
        case 'High':
            speedTop.value = 450
            break
    }
    adjustIntensity('Medium')
}
</script>

<template>
    <div class="glass card flex flex-col gap-4">
        <div>
            Pulse Intensity
            <ExclusiveSelect :options="['Low', 'Medium', 'High']" @update:selected="adjustIntensity"></ExclusiveSelect>
        </div>
        <div>
            Brightness
            <ExclusiveSelect :options="['Low', 'Medium', 'High']" @update:selected="adjustBrightness"></ExclusiveSelect>
        </div>
    </div>
</template>