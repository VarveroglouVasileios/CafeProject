import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/playpen-sans/wght.css'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

createApp(App).use(router).mount('#app')
