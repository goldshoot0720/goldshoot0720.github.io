function CountdownViewModel() {
  var targetTime = new Date(2025, 6, 5, 4, 18).getTime();
  var self = this;

  self.countdownSeconds = ko.observable(0);
  self.currentTime = ko.observable(new Date().toLocaleString());

  self.formattedCountdown = ko.computed(function() {
    var sec = self.countdownSeconds();
    var days = Math.floor(sec / (24 * 3600));
    var hours = Math.floor((sec % (24 * 3600)) / 3600);
    var minutes = Math.floor((sec % 3600) / 60);
    var seconds = sec % 60;
    return `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;
  });

  self.updateCountdown = function() {
    var now = Date.now();
    self.countdownSeconds(Math.max(0, Math.floor((targetTime - now) / 1000)));
    self.currentTime(new Date().toLocaleString());
  };

  setInterval(self.updateCountdown, 1000);
}

ko.applyBindings(new CountdownViewModel(), document.getElementById('countdown'));
