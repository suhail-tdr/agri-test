/* =====================================================
   GreenField AgriTech — Honeypot Tracker
   Backend URL is set via setup.html — no manual editing!
   ===================================================== */
(function HoneypotTracker() {

  // Reads URL set by setup.html automatically
  var BACKEND_URL = (
    'https://greenfield-backend-8scu.onrender.com' ||
    localStorage.getItem('hp_backend_url') ||
    ''
  );

  var HP_KEY = 'gf_threat_logs';
  var MAX_LOCAL = 200;

  function getVisitorInfo() {
    return {
      ts:       new Date().toISOString(),
      ts_local: new Date().toLocaleString('en-IN'),
      url:      window.location.href,
      page:     window.location.pathname,
      ref:      document.referrer || 'Direct',
      ua:       navigator.userAgent,
      browser:  getBrowser(),
      os:       getOS(),
      screen:   screen.width + 'x' + screen.height,
      lang:     navigator.language,
      tz:       Intl.DateTimeFormat().resolvedOptions().timeZone,
      touch:    navigator.maxTouchPoints > 0,
    };
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Other';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Other';
  }

  function sendLog(event, extra) {
    var payload = Object.assign({ event: event }, getVisitorInfo(), extra || {});

    if (BACKEND_URL) {
      fetch(BACKEND_URL + '/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function() {});
    }

    try {
      var logs = JSON.parse(localStorage.getItem(HP_KEY) || '[]');
      logs.unshift(Object.assign({ id: Date.now() }, payload));
      if (logs.length > MAX_LOCAL) logs.length = MAX_LOCAL;
      localStorage.setItem(HP_KEY, JSON.stringify(logs));
    } catch(e) {}
  }

  sendLog('PAGE_VISIT');

  var arrivedAt = Date.now();
  window.addEventListener('beforeunload', function() {
    sendLog('PAGE_EXIT', { duration_secs: Math.round((Date.now() - arrivedAt) / 1000) });
  });

  document.addEventListener('mousemove', function() {
    sendLog('HUMAN_INTERACTION', { type: 'mouse_move' });
  }, { once: true });

  window.addEventListener('scroll', function() {
    sendLog('HUMAN_INTERACTION', {
      type: 'scroll',
      depth: Math.round((window.scrollY / (document.body.scrollHeight || 1)) * 100) + '%'
    });
  }, { once: true });

  window.HP = { sendLog: sendLog, BACKEND_URL: BACKEND_URL };

})();