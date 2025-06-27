const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const Home = {
    template: `
        <div class="p-8 text-center">
          <h2 class="text-6xl font-bold mb-6">首頁</h2>
          <p class="text-2xl">歡迎來到我的網站 👋</p>
        </div>
      `
};

const Countdown = {
    template: `
        <div class="max-w-xl mx-auto mt-10 p-6 text-center card bg-base-200 shadow-xl">
          <h2 class="text-6xl font-bold mb-6 text-primary">歷史倒數</h2>
          <div class="text-7xl font-mono text-secondary">
            {{ formattedCountdown }}
          </div>
        </div>
      `,
    data() {
        return {
            countdownSeconds: 0,
            targetTime: new Date(2025, 6, 5, 4, 18).getTime(),
            timer: null,
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
            const diff = Math.floor((this.targetTime - now) / 1000);
            this.countdownSeconds = diff > 0 ? diff : 0;
        },
    },
};

const About = {
    template: `
        <div class="p-8 text-center">
          <h2 class="text-6xl font-bold mb-6">關於</h2>
          <p class="text-2xl">這是一個用 Vue + Tailwind + daisyUI 製作的倒數頁面。</p>
        </div>
      `
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
        return {
            isMenuOpen: false,
        };
    },
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
    },
    template: `
        <div class="container mx-auto p-4">
          <!-- 響應式導覽列 -->
          <nav class="navbar bg-base-300 rounded-xl shadow mb-6">
            <div class="flex-1">
              <a class="text-3xl font-bold">🔥 鋒兄倒數</a>
            </div>
            <div class="flex-none lg:hidden">
              <button @click="toggleMenu" class="btn btn-square btn-ghost text-4xl">☰</button>
            </div>
            <div :class="{'hidden': !isMenuOpen}" class="flex flex-col lg:flex-row gap-4 mt-4 lg:mt-0 lg:gap-6 lg:block">
              <router-link to="/" class="btn btn-ghost text-2xl">首頁</router-link>
              <router-link to="/countdown" class="btn btn-ghost text-2xl">歷史倒數</router-link>
              <router-link to="/about" class="btn btn-ghost text-2xl">關於</router-link>
            </div>
          </nav>

          <!-- 內容區 -->
          <router-view></router-view>
        </div>
      `
});

app.use(router);
app.mount('#app');