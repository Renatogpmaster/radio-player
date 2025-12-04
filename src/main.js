// main.js
import { createApp } from 'vue';
import App from '@/App.vue';
import router from './router.js';
import store from './store';
import i18n from './i18n/i18n.js';

const app = createApp(App);

// Install plugins (router, store, i18n)
app.use(router);
app.use(store);
app.use(i18n);

app.mount('#app');
