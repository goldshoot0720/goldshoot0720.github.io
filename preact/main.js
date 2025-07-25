(() => {
    const { h, render } = preact;
    const { useState, useEffect } = preactHooks;
    const { Router, Link } = preactRouter;

    function Countdown() {
        const [countdownSeconds, setCountdownSeconds] = useState(0);
        const [now, setNow] = useState(new Date());
        const targetTime = new Date(2025, 6, 5, 4, 18).getTime();

        useEffect(() => {
            const timer = setInterval(() => {
                const nowTs = Date.now();
                setCountdownSeconds(Math.max(0, Math.floor((targetTime - nowTs) / 1000)));
                setNow(new Date());
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        const days = Math.floor(countdownSeconds / (24 * 3600));
        const hours = Math.floor((countdownSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((countdownSeconds % 3600) / 60);
        const seconds = countdownSeconds % 60;

        return h("div", { class: "text-center p-6" }, [
            h("h1", { class: "text-4xl font-bold text-red-600 mb-4" }, "🔥 歷史倒數：大審判 🔥"),
            h("div", { class: "text-xl mb-4" }, "🕒 現在時間：", h("code", null, now.toLocaleString())),
            h("div", { class: "text-3xl font-mono mb-4" }, `⏳ ${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`),
            h("p", null, "預定審判時間：2025/07/05 04:18"),
            h("div", { class: "mt-6" }, h(Link, { href: "/" }, "🏠 首頁"))
        ]);
    }

    function Home() {
        return h("div", { class: "text-center p-6" }, [
            h("h2", { class: "text-3xl font-bold mb-4" }, "⚖️ 歡迎來到大審判倒數 SPA"),
            h(Link, { href: "/countdown", class: "text-blue-500 underline text-xl" }, "⏳ 前往倒數頁"),
            h("br"),
            h(Link, { href: "/about", class: "text-blue-500 underline text-xl" }, "ℹ️ 關於本站")
        ]);
    }

    function About() {
        return h("div", { class: "text-center p-6" }, [
            h("h2", { class: "text-3xl font-bold mb-4" }, "關於本站"),
            h("p", null, "這是一個使用 Preact + Router 架構的簡易單頁應用倒數器"),
            h("div", { class: "mt-6" }, h(Link, { href: "/" }, "🏠 回首頁"))
        ]);
    }

    function App() {
        return h("div", { class: "max-w-2xl mx-auto p-4" }, [
            h("nav", { class: "mb-6 text-center space-x-4" }, [
                h(Link, { href: "/", class: "text-blue-500 hover:underline" }, "🏠 首頁"),
                h(Link, { href: "/countdown", class: "text-blue-500 hover:underline" }, "⏳ 倒數"),
                h(Link, { href: "/about", class: "text-blue-500 hover:underline" }, "ℹ️ 關於")
            ]),
            h(Router, null, [
                h(Home, { path: "/" }),
                h(Countdown, { path: "/countdown" }),
                h(About, { path: "/about" })
            ])
        ]);
    }

    render(h(App), document.getElementById("app"));
})();
