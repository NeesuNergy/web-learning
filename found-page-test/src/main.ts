import { createApp } from 'vue'
import App from './App.vue'
import {Icon} from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(Icon)
app.mount('#app')
