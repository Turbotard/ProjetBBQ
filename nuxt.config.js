export default defineNuxtConfig({
  css: ['vuetify/styles'],

  build: {
    transpile: ['vuetify'],
  },

  plugins: ['~/plugins/vuetify.js'],

  devtools: {
    enabled: true,
  },
});
