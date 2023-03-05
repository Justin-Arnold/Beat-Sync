// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt','@nuxt/image-edge',],
    typescript: {
        typeCheck: true,
    },
    css: ['~/assets/css/main.css'],
    runtimeConfig: {
        public: {
            clientId : process.env.CLIENT_ID
        }
    }

})
