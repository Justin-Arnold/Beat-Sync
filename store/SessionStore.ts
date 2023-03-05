import { defineStore } from 'pinia'


export const useSessionStore = defineStore('SessionStore', {
    state: () => {
        return  {
            accessToken : '',
            sessionExpiration: ref(0),
            sessionId : '',
            redirectUri : 'http://localhost:3000/authenticated',
            responseType : 'token',
            scopes : 'user-read-currently-playing, user-read-playback-state, user-read-recently-played, user-read-playback-state, streaming, user-modify-playback-state, user-read-private, user-read-email',
            authorizeBaseUri: 'https://accounts.spotify.com/authorize',
        }
    },
    getters: {
        isSessionExpired(): boolean {
            return this.sessionExpiration < Date.now()
        },
        authorizeUri(): string {
            const config = useRuntimeConfig()
            const query = {
                response_type: this.responseType,
                client_id: config.clientId,
                redirect_uri: this.redirectUri,
                scope: this.scopes,
                state: this.sessionId,
            }
            const queryString = `?${new URLSearchParams(query)}`
            const fullUri = `${this.authorizeBaseUri}${queryString}`
            return fullUri
        },
    },
    actions: {
        setSessionId() {
            this.sessionId = generateNewSessionId()
        },
        setAccessToken(value: string) {
            this.accessToken = value
        },
        logout(redirectEndpoint: string) {
            this.setAccessToken('')
            this.setSessionExpiration(0)
            this.sessionId = ''
            navigateTo(redirectEndpoint)
        },
        setSessionExpiration(secondsUntilExpiration: number) {
            const now = Date.now()
            const milliseconds = secondsUntilExpiration * 1000
            this.sessionExpiration = now + milliseconds
        },
    },
    persist: true
})

// Helpers ---------------------------------------------------------------------
function generateNewSessionId() {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}