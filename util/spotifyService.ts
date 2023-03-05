import { FeaturedPlaylists, AudioAnalysis, AudioFeatures, CurrentlyPlaying } from "spotify-types"

export const service = {
    getFeaturedPlaylists: async (accessToken: string): Promise<FeaturedPlaylists> => {
        const response: FeaturedPlaylists = await $fetch(`https://api.spotify.com/v1/browse/featured-playlists`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    },
    playPlaylist: async (accessToken: string, deviceId: string, playlistId: string ): Promise<any> => {
        const response = await $fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( {"context_uri": `spotify:playlist:${playlistId}` } )
        });
        return response;
    },
    getTrackAnalysis: async (accessToken: string, trackId: string): Promise<AudioAnalysis> => {
        const response: AudioAnalysis = await $fetch(`https://api.spotify.com/v1/audio-analysis/${trackId}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    },
    getTrackFeatures: async (accessToken: string, trackId: string): Promise<AudioFeatures> => {
        const response: AudioFeatures = await $fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    },
    getCurrentlyPlaying: async (accessToken: string): Promise<CurrentlyPlaying> => {
        const response: CurrentlyPlaying = await $fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    },
}
