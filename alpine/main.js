document.addEventListener('alpine:init', () => {
    Alpine.data('pageRouter', () => ({
        route: 'home',
        updateRoute() {
            const hash = location.hash.replace('#', '');
            this.route = hash || 'home';
        },
        init() {
            this.updateRoute();
            window.addEventListener('hashchange', () => this.updateRoute());
        }
    }));

    Alpine.data('countdownTimer', () => ({
        now: '',
        display: '',
        interval: null,
        target: new Date(2025, 6, 5, 4, 18).getTime(), // 注意：7月是 index 6
        start() {
            this.update();
            this.interval = setInterval(() => this.update(), 1000);
        },
        update() {
            const nowDate = new Date();
            const diff = Math.max(0, Math.floor((this.target - nowDate.getTime()) / 1000));
            const days = Math.floor(diff / (3600 * 24));
