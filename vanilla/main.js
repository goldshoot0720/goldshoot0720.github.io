const view = document.getElementById('view');
const targetTime = new Date(2025, 6, 5, 4, 18).getTime(); // 月份 0-based

let intervalId = null;

function renderHome() {
    clearInterval(intervalId);
    view.innerHTML = `
    <div class="text-center">
      <h2 class="text-5xl font-extrabold">🏠 首頁</h2>
      <p class="mt-4">歡迎來到倒數計時頁面！</p>
    </div>
  `;
}

function renderAbout() {
    clearInterval(intervalId);
    view.innerHTML = `
    <div class="text-center">
      <h2 class="text-5xl font-extrabold">ℹ️ 關於</h2>
      <p class="mt-4">這是一個使用 Vanilla JavaScript 撰寫的大審判倒數計時應用。</p>
    </div>
  `;
}

function renderCountdown() {
    view.innerHTML = `
    <div class="text-center">
      <h1 class="text-6xl font-extrabold mb-4 text-error">🔥 歷史倒數：大審判 🔥</h1>
      <div class="mb-6">🕒 現在時間：<span id="now" class="font-mono"></span></div>
      <div class="text-5xl font-mono mb-8 flash" id="countdown">⏳ 載入中...</div>
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="crimson" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse" style="margin-bottom: 1.5rem;">
        <path d="M12 2v20M5 9l7 4 7-4" />
        <path d="M5 20h14M9 20V10M15 20V10" />
      </svg>
      <p>預定審判時間：2025/07/05 04:18</p>
    </div>
  `;

    function updateCountdown() {
        const now = new Date();
        const diff = Math.max(0, Math.floor((targetTime - now.getTime()) / 1000));

        const days = Math.floor(diff / (3600 * 24));
        const hours = Math.floor((diff % (3600 * 24)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        document.getElementById('now').textContent = now.toLocaleString();
        document.getElementById('countdown').textContent = `⏳ ${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
    }

    updateCountdown();
    intervalId = setInterval(updateCountdown, 1000);
}

function router() {
    const hash = location.hash || '#home';
    switch (hash) {
        case '#home': renderHome(); break;
        case '#countdown': renderCountdown(); break;
        case '#about': renderAbout(); break;
        default: renderHome();
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
