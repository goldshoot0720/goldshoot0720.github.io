angular.module("countdownApp", ["ngRoute"]).config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/", {
        template:
          '<div class="text-center"><h2 class="text-5xl font-extrabold">首頁</h2></div>',
      })
      .when("/countdown", {
        template: `
      <div class="text-center">
        <h1 class="text-5xl font-extrabold mb-4 text-error">🔥 歷史倒數：大審判 🔥</h1>
        <div class="mb-6">
          🕒 現在時間：<span class="font-mono">{{currentTime}}</span>
        </div>
        <div class="text-5xl font-mono mb-8 flash">
          ⏳ {{days}} 天 {{hours}} 時 {{minutes}} 分 {{seconds}} 秒
        </div>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="crimson" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse" style="margin-bottom: 1.5rem;">
          <path d="M12 2v20M5 9l7 4 7-4" />
          <path d="M5 20h14M9 20V10M15 20V10" />
        </svg>
        <p>預定審判時間：2025/07/05 04:18</p>
      </div>
      `,
        controller: [
          "$scope",
          "$interval",
          function ($scope, $interval) {
            const targetTime = new Date(2025, 6, 5, 4, 18).getTime();

            function updateCountdown() {
              const now = Date.now();
              const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
              let sec = diff;

              $scope.days = Math.floor(sec / (24 * 3600));
              sec %= 24 * 3600;
              $scope.hours = Math.floor(sec / 3600);
              sec %= 3600;
              $scope.minutes = Math.floor(sec / 60);
              $scope.seconds = sec % 60;
              $scope.currentTime = new Date().toLocaleString();
            }

            updateCountdown();
            const stop = $interval(updateCountdown, 1000);

            $scope.$on("$destroy", function () {
              $interval.cancel(stop);
            });
          },
        ],
      })
      .when("/about", {
        template:
          '<div class="text-center"><h2 class="text-5xl font-extrabold">關於</h2></div>',
      })
      .otherwise({
        redirectTo: "/",
      });
  },
]);
