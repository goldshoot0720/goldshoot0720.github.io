function countdown() {
  return {
    countdownSeconds: 0,
    targetTime: new Date(2025, 6, 5, 4, 18).getTime(),
    currentTime: moment().format("YYYY/MM/DD HH:mm:ss"),
    timer: null,

    init() {
      this.updateCountdown();
      this.timer = setInterval(() => {
        this.updateCountdown();
      }, 1000);
      setInterval(() => {
        this.currentTime = moment().format("YYYY/MM/DD HH:mm:ss");
      }, 1000);
    },

    updateCountdown() {
      const now = Date.now();
      this.countdownSeconds = Math.max(
        0,
        Math.floor((this.targetTime - now) / 1000)
      );
    },

    get formattedCountdown() {
      const sec = this.countdownSeconds;
      const days = Math.floor(sec / (24 * 3600));
      const hours = Math.floor((sec % (24 * 3600)) / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;
      return `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
    },
  };
}
