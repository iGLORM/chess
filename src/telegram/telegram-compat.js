(function () {
  const isTelegram = window.Telegram && window.Telegram.WebApp;

  // Web fullscreen fallback (when window.electron is absent)
  if (!window.electron) {
    window.electron = {
      toggleFullscreen: function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen().catch(function () {});
        }
      },
      onFullscreenChange: function () {},
      saveScreenshot: function () {},
      onScreenshotSaved: function () {},
    };
  }

  if (!isTelegram) return;

  var tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  // Try to request fullscreen in Telegram (API v8+)
  if (tg.requestFullscreen) {
    try { tg.requestFullscreen(); } catch (e) {}
  }

  // Disable vertical swipes so scrolling doesn't close the app
  if (tg.disableVerticalSwipes) {
    tg.disableVerticalSwipes();
  }

  // Ensure canvases fill the Telegram viewport after expansion
  tg.onEvent('viewportChanged', function () {
    var canvases = document.querySelectorAll('canvas');
    for (var i = 0; i < canvases.length; i++) {
      canvases[i].style.width = window.innerWidth + 'px';
      canvases[i].style.height = window.innerHeight + 'px';
    }
    if (typeof PixiApp !== 'undefined' && PixiApp.app && PixiApp.app.renderer) {
      PixiApp.app.renderer.resize(1280, 800);
    }
  });

  // Back button — wired up after DOM and game scripts load
  document.addEventListener('DOMContentLoaded', function () {
    tg.BackButton.onClick(function () {
      if (typeof store !== 'undefined') {
        var screen = store.get('screen');
        if (screen === 'home') {
          tg.close();
        } else {
          if (typeof switchScreen === 'function') switchScreen('home');
        }
      }
    });

    // Show/hide back button based on current screen
    if (typeof store !== 'undefined') {
      store.on('screen', function (screen) {
        if (screen === 'home') {
          tg.BackButton.hide();
        } else {
          tg.BackButton.show();
        }
      });
    }

    // Haptic feedback — patch audioManager methods
    if (typeof audioManager !== 'undefined' && tg.HapticFeedback) {
      var hf = tg.HapticFeedback;

      var origPlayButton = audioManager.playButton;
      if (origPlayButton) {
        audioManager.playButton = function () {
          origPlayButton.apply(audioManager, arguments);
          hf.impactOccurred('light');
        };
      }

      var origPlayMove = audioManager.playMove;
      if (origPlayMove) {
        audioManager.playMove = function () {
          origPlayMove.apply(audioManager, arguments);
          hf.impactOccurred('medium');
        };
      }

      var origPlayCapture = audioManager.playCapture;
      if (origPlayCapture) {
        audioManager.playCapture = function () {
          origPlayCapture.apply(audioManager, arguments);
          hf.impactOccurred('heavy');
        };
      }
    }
  });

  // Landscape orientation hint
  var hint = document.getElementById('rotateHint');
  if (hint) {
    function checkOrientation() {
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        hint.style.display = 'flex';
      } else {
        hint.style.display = 'none';
      }
    }
    hint.addEventListener('click', function () { hint.style.display = 'none'; });
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    setTimeout(checkOrientation, 300);
  }
})();
