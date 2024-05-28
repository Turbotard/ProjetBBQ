export default defineNuxtConfig({
  buildModules: [
    '@nuxtjs/axios',
  ],
  axios: {
    baseURL: '/', 
  },
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
  plugins: ['~/plugins/vuetify.js'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
});
