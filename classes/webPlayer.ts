import { usePlayerStore } from "~~/store/PlayerStore";
import { service as spotifyService } from '../util/spotifyService';
import { storeToRefs } from "pinia";

const PLAYER_NAME = "Synthwave Player"
const PLAYER_VOLUME = 1

interface Hooks {
    ready?: (data: any) => void;
    not_ready?: (data: any) => void;
    player_state_changed?: (data: any) => void;
    initialization_error?: (data: any) => void;
    authentication_error?: (data: any) => void;
    account_error?: (data: any) => void;
    playback_error?: (data: any) => void;
    progress?: (data: any) => void;
    autoplay_failed?: (data: any) => void;
}

export default class WebPlayer {

    public _player?: Spotify.Player
    public id?: string

    constructor(accessToken: string, hooks?: Hooks) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
        const intervalIds: Ref<Array<number>> = ref([])
        const playerStore = usePlayerStore();
        const { currentProgress, currentlyPlaying, isPlaying } = storeToRefs(playerStore);
        let hasInterval = false
        window.onSpotifyWebPlaybackSDKReady = async () => {
            this._player = new Spotify.Player({
                name: PLAYER_NAME,
                getOAuthToken:cb => { cb(accessToken); },
                volume: PLAYER_VOLUME
            })

            this._player.addListener('ready', (data) => {
                if (hooks?.ready) {
                    hooks.ready(data)
                }
                this.id = data.device_id
            });

            this._player.addListener('not_ready', (data) => {
                if (hooks?.not_ready) {
                    hooks.not_ready(data)
                }
            });

            this._player.addListener('player_state_changed', async (data) => {
                const playerState = () => {
                    this.getPlayerState().then((state: any) => {
                        if (!state) return
                        currentProgress.value = state.position
                    })
                }

                if (data.paused) {
                    isPlaying.value = false
                    intervalIds.value.forEach((id: number) => {
                        window.clearInterval(id)
                    })
                    hasInterval = false
                } else {
                    isPlaying.value = true
                    if(!hasInterval) {
                        intervalIds.value.push(window.setInterval(playerState, 50))
                        hasInterval = true
                    }

                }

                if (currentlyPlaying.value?.item?.id !== data.track_window.current_track.id) {
                    currentlyPlaying.value = await spotifyService.getCurrentlyPlaying(accessToken)
                    if (!currentlyPlaying.value.item) return
                    if (!!currentlyPlaying.value?.item?.id) {
                        const [ analysis, features ] = await Promise.all([
                            spotifyService.getTrackAnalysis(accessToken, currentlyPlaying.value.item.id),
                            spotifyService.getTrackFeatures(accessToken, currentlyPlaying.value.item.id)
                        ])
                        playerStore.trackAnalysis = analysis
                        playerStore.trackFeatures = features
                    }
                }

                if (hooks?.player_state_changed) {
                    hooks.player_state_changed(data)
                }

            });

            this._player.addListener('initialization_error', (data) => {
                if (hooks?.initialization_error) {
                    hooks.initialization_error(data)
                }
            });

            this._player.addListener('authentication_error', (data) => {
                if (hooks?.authentication_error) {
                    hooks.authentication_error(data)
                }
            });

            this._player.addListener('account_error', (data) => {
                if (hooks?.account_error) {
                    hooks.account_error(data)
                }
            });

            this._player.addListener('progress' as any, (data: any) => {
                if (hooks?.progress) {
                    hooks.progress(data)
                }
            });

            this._player.addListener('playback_error', (data) => {
                if (hooks?.playback_error) {
                    hooks.playback_error(data)
                }
            });

            this._player.addListener('autoplay_failed' as any, (data: any) => {
                if (hooks?.autoplay_failed) {
                    hooks.autoplay_failed(data)
                }
            });

            this._player.connect()
        }
    }

    public async resume() {
        if (!this._player) {
            throw new Error("Player not initialized")
        }
        await this._player.resume()
    }

    public async pause() {
        if (!this._player) {
            throw new Error("Player not initialized")
        }
        await this._player.pause()
    }

    public async next() {
        if (!this._player) {
            throw new Error("Player not initialized")
        }
        await this._player.nextTrack()
    }

    public async destroy() {
        if (!this._player) {
            throw new Error("Player not initialized")
        }
        await this._player.disconnect()
    }

    public async getPlayerState(): Promise<Spotify.PlaybackState | null> {
        if (!this._player) {
            throw new Error("Player not initialized")
        }
        const state = await this._player.getCurrentState()
        return state
    }

    public async getCurrentState() {
        if(!this._player) {
            throw new Error("Player not initialized")
        }
        const playerState = await this._player.getCurrentState()
        return playerState
    };
}