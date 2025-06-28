import { createApp } from "marko";
import { createStore } from "marko/store";

const Countdown = {
  template: `
    <div class="text-center p-4 max-w-3xl mx-auto">
      <h1 class="text-5xl md:text-6xl font-extrabold mb-4 text-red-600">🔥 歷史倒數：大審判 🔥</h1>
      <div class="text-lg md:text-2xl mb-6">
        🕒 現在時間：<span class="font-mono">${currentTime}</span>
      </div>
      <div class="text-5xl md:text-6xl font-mono mb-8">
        ⏳ <span>${formattedCountdown}</span>
      </div>
      <div class="flex justify-center items-center mb-6">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="crimson" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse">
          <path d="M12 2v20M5 9l7 4 7-4" />
          <path d="M5 20h14M9 20V10M15 20V10" />
        </svg>
      </div>
      <p class="text-lg md:text-xl">預定審判時間：2025/07/05 04:18</p>
    </div>
  `,
  state: {
    countdownSeconds: 0,
    targetTime: new Date(2025, 6, 5, 4, 18).getTime(),
    currentTime: new Date().toLocaleString(),
    timer: null,
  },
  computed: {
    formattedCountdown() {
      const sec = this.state.countdownSeconds;
      const days = Math.floor(sec / (24 * 3600));
      const hours = Math.floor((sec % (24 * 3600)) / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;
      return `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
    },
  },
  mounted() {
    this.updateCountdown();
    this.state.timer = setInterval(this.updateCountdown, 1000);
    setInterval(() => {
      this.state.currentTime = new Date().toLocaleString();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.state.timer);
  },
  methods: {
    updateCountdown() {
      const now = Date.now();
      this.state.countdownSeconds = Math.max(
        0,
        Math.floor((this.state.targetTime - now) / 1000)
      );
    },
  },
};

createApp(Countdown).mount("#app");
