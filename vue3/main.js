const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const Countdown = {
    template: `
        <div class="text-center p-4 max-w-3xl mx-auto">
          <h1 class="text-5xl md:text-6xl font-extrabold mb-4 text-error">🔥 歷史倒數：大審判 🔥</h1>
          
          <!-- 現在時間 -->
          <div class="text-lg md:text-2xl mb-6">
            🕒 現在時間：<span class="font-mono">{{ currentTime }}</span>
          </div>

          <!-- 倒數區域 -->
          <div class="text-5xl md:text-6xl font-mono mb-8 flash judgment-animate">
            ⏳ {{ formattedCountdown }}
          </div>

          <!-- SVG 審判圖示 -->
          <div class="flex justify-center items-center mb-6">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="crimson" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse">
              <path d="M12 2v20M5 9l7 4 7-4" />
              <path d="M5 20h14M9 20V10M15 20V10" />
            </svg>
          </div>

          <p class="text-lg md:text-xl">預定審判時間：2025/07/05 04:18</p>
        </div>
      `,
    data() {
        return {
            countdownSeconds: 0,
            targetTime: new Date(2025, 6, 5, 4, 18).getTime(),
            timer: null,
            now: new Date(),
        };
    },
    computed: {
        formattedCountdown() {
            const sec = this.countdownSeconds;
            const days = Math.floor(sec / (24 * 3600));
            const hours = Math.floor((sec % (24 * 3600)) / 3600);
            const minutes = Math.floor((sec % 3600) / 60);
            const seconds = sec % 60;
            return `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
        },
        currentTime() {
            return new Date().toLocaleString();
        },
    },
    mounted() {
        this.updateCountdown();
        this.timer = setInterval(this.updateCountdown, 1000);
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
    methods: {
        updateCountdown() {
            const now = Date.now();
            this.countdownSeconds = Math.max(0, Math.floor((this.targetTime - now) / 1000));
            this.now = new Date();
        },
    },
};

const Home = {
    template: `<div class="p-6 text-center"><h2 class="text-5xl font-bold">首頁</h2></div>`
};

const About = {
    template: `<div class="p-6 text-center"><h2 class="text-5xl font-bold">關於</h2></div>`
};

const routes = [
    { path: '/', component: Home },
    { path: '/countdown', component: Countdown },
    { path: '/about', component: About },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const app = createApp({
    data() {
        return { isMenuOpen: false };
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
    },
    template: `
        <div class="container mx-auto p-4">
          <nav class="navbar bg-base-200 rounded-xl shadow mb-6">
            <div class="flex-1">
              <a class="text-3xl font-bold">⚖️ 大審判倒數</a>
            </div>
            <div class="flex-none lg:hidden">
              <button @click="toggleMenu" class="btn btn-square btn-ghost text-3xl">☰</button>
            </div>
            <div :class="{'hidden': !isMenuOpen}" class="flex flex-col lg:flex-row gap-4 mt-4 lg:mt-0 lg:gap-6 lg:block">
              <router-link to="/" class="btn btn-ghost text-2xl">首頁</router-link>
              <router-link to="/countdown" class="btn btn-ghost text-2xl">倒數</router-link>
              <router-link to="/about" class="btn btn-ghost text-2xl">關於</router-link>
            </div>
          </nav>

          <router-view></router-view>
        </div>
      `
});

app.use(router);
app.mount('#app');