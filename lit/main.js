import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@2.7.5/+esm';

class CountdownTimer extends LitElement {
    static properties = {
        countdownSeconds: { type: Number },
        now: { type: Object },
    };

    static styles = css`
    h1 {
      color: crimson;
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .time {
      font-family: monospace;
      font-size: 2rem;
      margin: 1rem 0;
    }
    p {
      font-size: 1.2rem;
    }
  `;

    constructor() {
        super();
        this.countdownSeconds = 0;
        this.now = new Date();
        this.targetTime = new Date(2025, 6, 5, 4, 18).getTime();
    }

    connectedCallback() {
        super.connectedCallback();
        this._timer = setInterval(() => this.updateCountdown(), 1000);
        this.updateCountdown();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._timer);
    }

    updateCountdown() {
        const nowTs = Date.now();
        this.countdownSeconds = Math.max(0, Math.floor((this.targetTime - nowTs) / 1000));
        this.now = new Date();
    }

    get formattedCountdown() {
        const sec = this.countdownSeconds;
        const days = Math.floor(sec / (24 * 3600));
        const hours = Math.floor((sec % (24 * 3600)) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;
        return `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
    }

    render() {
        return html`
      <h1>🔥 歷史倒數：大審判 🔥</h1>
      <div>🕒 現在時間：<code>${this.now.toLocaleString()}</code></div>
      <div class="time">⏳ ${this.formattedCountdown}</div>
      <p>預定審判時間：2025/07/05 04:18</p>
    `;
    }
}

customElements.define('countdown-timer', CountdownTimer);
