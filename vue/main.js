const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const Countdown = {
  template: `
    <div class="text-center p-4 max-w-3xl mx-auto">
      <!-- 上方 SVG -->
      <div class="flex justify-center items-center mb-6">
        <svg v-for="n in 3" :key="'top'+n" width="120" height="120" viewBox="0 0 24 24"
          fill="none" stroke="crimson" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse mx-2">
          <path d="M12 2v20M5 9l7 4 7-4" />
          <path d="M5 20h14M9 20V10M15 20V10" />
        </svg>
      </div>

      <h1 class="text-5xl md:text-6xl font-extrabold mb-4 text-error">🔥 人類最後的歷史倒數之大審判 🔥</h1>
      <h2 class="text-5xl md:text-6xl font-extrabold mb-4 text-error">🔥 決不會延後：不早不晚 🔥</h2>
      <h3 class="text-2xl md:text-3xl font-bold mb-6 text-error">🔥 依序先審判各國首都 → 各國大都市 → 各國小都市 → 各國鄉村 → 各國活人 → 各國死人→ 各國活物→ 各國死物 🔥</h3>

      <div class="text-lg md:text-2xl mb-6">
        🕒 現在時間：<span class="font-mono">{{ currentTime }}</span>
      </div>

      <div class="text-5xl md:text-6xl font-mono mb-8 animate-pulse">
        ⏳ {{ formattedCountdown }}
      </div>

      <!-- 下方 SVG -->
      <div class="flex justify-center items-center mb-6">
        <svg v-for="n in 3" :key="'bottom'+n" width="120" height="120" viewBox="0 0 24 24"
          fill="none" stroke="crimson" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse mx-2">
          <path d="M12 2v20M5 9l7 4 7-4" />
          <path d="M5 20h14M9 20V10M15 20V10" />
        </svg>
      </div>

      <p class="text-lg md:text-xl">審判開始時間：2025/07/05 04:18（各國首都當地時間）</p>
    </div>
  `,
  data() {
    return {
      countdownSeconds: 0,
      currentTime: "",
      targetTime: new Date(2025, 6, 5, 4, 18).getTime(), // 注意：月從 0 開始，7月是 6
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
  methods: {
    updateCountdown() {
      const now = new Date();
      this.countdownSeconds = Math.max(
        0,
        Math.floor((this.targetTime - now.getTime()) / 1000)
      );
      this.currentTime = now.toLocaleString();
    },
  },
  mounted() {
    this.updateCountdown();
    this.timer = setInterval(this.updateCountdown, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};

const Home = {
  template: `<div class="p-6 text-center"><h2 class="text-5xl font-bold">🏠 首頁</h2></div>`,
};

const About = {
  template: `<div class="p-6 text-center"><h2 class="text-5xl font-bold">ℹ️ 關於</h2></div>`,
};

const routes = [
  { path: "/", component: Home },
  { path: "/countdown", component: Countdown },
  { path: "/about", component: About },
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
  `,
});

app.use(router);
app.mount("#app");
