// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 1. Bootstrap과 SCSS 임포트
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // Bootstrap JS
import '@/assets/scss/main.scss' // 우리의 커스텀 SCSS 파일

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
