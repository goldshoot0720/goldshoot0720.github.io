const { useState, useEffect } = React;
const { BrowserRouter, Route, Link, Switch } = ReactRouterDOM;

const Countdown = () => {
    const targetTime = new Date(2025, 6, 5, 4, 18).getTime();

    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const updateCountdown = () => {
            const nowTimestamp = Date.now();
            setCountdownSeconds(Math.max(0, Math.floor((targetTime - nowTimestamp) / 1000)));
            setNow(new Date());
        };

        updateCountdown(); // 初始呼叫一次，避免等一秒才更新
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [targetTime]);

    const formattedCountdown = (() => {
        const sec = countdownSeconds;
        const days = Math.floor(sec / (24 * 3600));
        const hours = Math.floor((sec % (24 * 3600)) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;
        return `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
    })();

    return (
        <div className="text-center p-4 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-error">
                🔥 歷史倒數：大審判 🔥
            </h1>

            <div className="text-lg md:text-2xl mb-6">
                🕒 現在時間：<span className="font-mono">{now.toLocaleString()}</span>
            </div>

            <div className="text-5xl md:text-6xl font-mono mb-8 flash judgment-animate">
                ⏳ {formattedCountdown}
            </div>

            <div className="flex justify-center items-center mb-6">
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="crimson"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                >
                    <path d="M12 2v20M5 9l7 4 7-4" />
                    <path d="M5 20h14M9 20V10M15 20V10" />
                </svg>
            </div>

            <p className="text-lg md:text-xl">預定審判時間：2025/07/05 04:18</p>
        </div>
    );
};

const Home = () => (
    <div className="p-6 text-center">
        <h2 className="text-5xl font-bold">首頁</h2>
    </div>
);

const About = () => (
    <div className="p-6 text-center">
        <h2 className="text-5xl font-bold">關於</h2>
    </div>
);

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <BrowserRouter>
            <div className="container mx-auto p-4">
                <nav className="navbar bg-base-200 rounded-xl shadow mb-6">
                    <div className="flex-1">
                        <a className="text-3xl font-bold">⚖️ 大審判倒數</a>
                    </div>

                    <div className="flex-none lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="btn btn-square btn-ghost text-3xl"
                            aria-label="Toggle menu"
                        >
                            ☰
                        </button>
                    </div>

                    <div
                        className={`flex flex-col lg:flex-row gap-4 mt-4 lg:mt-0 lg:gap-6 lg:block ${
                            isMenuOpen ? "" : "hidden"
                        }`}
                    >
                        <Link to="/" className="btn btn-ghost text-2xl" onClick={() => setIsMenuOpen(false)}>
                            首頁
                        </Link>
                        <Link to="/countdown" className="btn btn-ghost text-2xl" onClick={() => setIsMenuOpen(false)}>
                            倒數
                        </Link>
                        <Link to="/about" className="btn btn-ghost text-2xl" onClick={() => setIsMenuOpen(false)}>
                            關於
                        </Link>
                    </div>
                </nav>

                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/countdown" component={Countdown} />
                    <Route path="/about" component={About} />
                </Switch>
            </div>
        </BrowserRouter>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
