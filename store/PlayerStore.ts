import { defineStore } from 'pinia'
import { CurrentlyPlaying, AudioAnalysis, AudioFeatures } from 'spotify-types'
import WebPlayer from '../classes/webPlayer'


interface State {
    player: WebPlayer | null
    currentProgress: number
    currentlyPlaying: CurrentlyPlaying | null
    isPlaying: boolean
    trackAnalysis: AudioAnalysis | null
    trackFeatures: AudioFeatures | null
    speedTop: number
    speedBottom: number
}

export const usePlayerStore = defineStore('PlayerStore', {
    state: (): State => {
        return {
            player: null,
            currentProgress: 0,
            currentlyPlaying: null,
            isPlaying: false,
            trackAnalysis: null,
            trackFeatures: null,
            speedTop: 150,
            speedBottom: 130,
        }
    },
    actions: {
        togglePlayerIsPlaying() {
            if (this.player === null) {
                return;
            }
            if (this.isPlaying) {
                this.player.pause()
                this.isPlaying = false
            } else {
                this.player.resume()
                this.isPlaying = true
            }
        },
        goToNextTrack() {
            if (this.player === null) {
                return;
            }
            this.player.next()
        }
    }
})