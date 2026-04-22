/* =====================================================
   GreenField AgriTech — Main JavaScript
   ===================================================== */

// ── NAVBAR SCROLL ──────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

function toggleMenu() {
  document.getElementById('navMobile').classList.toggle('open');
}

// ── ANIMATED PARTICLES (hero background) ─────────────
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(125,206,141,${Math.random() * 0.3 + 0.1});
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite;
      animation-delay:${Math.random() * -8}s;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes particleFloat {
    0%,100%{transform:translateY(0) translateX(0);}
    33%{transform:translateY(-${Math.random()*30+10}px) translateX(${Math.random()*20-10}px);}
    66%{transform:translateY(${Math.random()*20+5}px) translateX(${Math.random()*20-10}px);}
  }`;
  document.head.appendChild(style);
})();

// ── LIVE SENSOR SIMULATION (Hero card) ─────────────────
const sensorRanges = {
  temp:  { base: 28.4, range: 1.2, id: 'h-temp', fmt: v => v.toFixed(1) + '°C' },
  humid: { base: 72, range: 4, id: 'h-humid', fmt: v => Math.round(v) + '%' },
  soil:  { base: 64, range: 5, id: 'h-soil', fmt: v => Math.round(v) + '%' },
  light: { base: 8.2, range: 0.8, id: 'h-light', fmt: v => v.toFixed(1) + 'k lux' },
};

function updateHeroSensors() {
  Object.values(sensorRanges).forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;
    const val = s.base + (Math.random() - 0.5) * s.range;
    el.textContent = s.fmt(val);
    el.style.transition = 'color 0.4s';
    el.style.color = '#2d7a3a';
    setTimeout(() => el.style.color = '', 600);
  });
}
setInterval(updateHeroSensors, 4000);

// ── CROP MONITOR ────────────────────────────────────────
const cropData = {
  rice: {
    stage:'Tillering', harvest:'42 days', yield:'4.2 t/ha', health:'87/100',
    water:'HIGH', disease:'LOW',
    moisture: [52, 58, 61, 55, 67, 63, 64],
  },
  veg: {
    stage:'Vegetative', harvest:'28 days', yield:'18 t/ha', health:'91/100',
    water:'MEDIUM', disease:'LOW',
    moisture: [48, 50, 53, 49, 55, 58, 57],
  },
  coconut: {
    stage:'Fruiting', harvest:'120 days', yield:'85 nuts/tree', health:'78/100',
    water:'LOW', disease:'MEDIUM',
    moisture: [38, 40, 37, 42, 44, 41, 43],
  },
  rubber: {
    stage:'Tapping', harvest:'Ongoing', yield:'1.8 kg/tree', health:'82/100',
    water:'LOW', disease:'LOW',
    moisture: [44, 46, 48, 45, 50, 52, 51],
  },
};

function showCrop(key) {
  const data = cropData[key];
  if (!data) return;

  // Update tabs
  document.querySelectorAll('.cm-tab').forEach((t, i) => {
    t.classList.toggle('active', ['rice','veg','coconut','rubber'][i] === key);
  });

  // Update stats
  setText('cs-stage', data.stage);
  setText('cs-harvest', data.harvest);
  setText('cs-yield', data.yield);
  setText('cs-health', data.health);
  setText('cs-water', data.water);
  setText('cs-disease', data.disease);

  setClass('cs-water', data.water === 'HIGH' ? 'cfs-val amber' : 'cfs-val green');
  setClass('cs-disease', data.disease === 'MEDIUM' ? 'cfs-val amber' : 'cfs-val green');

  // Render chart
  renderMoistureChart(data.moisture);
}

function renderMoistureChart(values) {
  const barsEl = document.getElementById('chart-bars');
  const axisEl = document.getElementById('chart-xaxis');
  if (!barsEl || !axisEl) return;

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const max = Math.max(...values);
  barsEl.innerHTML = '';
  axisEl.innerHTML = '';

  values.forEach((v, i) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar-item';
    bar.style.height = ((v / max) * 90) + 'px';
    bar.title = `${days[i]}: ${v}%`;
    barsEl.appendChild(bar);

    const label = document.createElement('span');
    label.textContent = days[i];
    axisEl.appendChild(label);
  });
}

// Initialize crop monitor
if (document.getElementById('cm-chart')) {
  showCrop('rice');
  // Animate sensors in crop section
  setInterval(() => {
    updateSensorEl('s-temp', 28.4, 1.2, v => v.toFixed(1) + '°C');
    updateSensorEl('s-hum', 72, 4, v => Math.round(v) + '%');
    updateSensorEl('s-soil', 64, 5, v => Math.round(v) + '%');
    updateSensorEl('s-ph', 6.8, 0.2, v => v.toFixed(1));
    updateSensorEl('s-wind', 12, 3, v => Math.round(v) + ' km/h');
    updateSensorEl('s-rain', 2.4, 0.5, v => v.toFixed(1) + 'mm');
  }, 3000);
}

// ── WEATHER FORECAST ────────────────────────────────────
const weatherForecast = [
  { day: 'Today', icon: '⛅', high: 31, low: 24, desc: 'Partly Cloudy', rain: '15%', today: true },
  { day: 'Tuesday', icon: '☀️', high: 33, low: 25, desc: 'Mostly Sunny', rain: '5%' },
  { day: 'Wednesday', icon: '🌧️', high: 27, low: 22, desc: 'Heavy Rain', rain: '90%' },
  { day: 'Thursday', icon: '⛈️', high: 25, low: 21, desc: 'Thunderstorm', rain: '85%' },
  { day: 'Friday', icon: '🌤️', high: 29, low: 23, desc: 'Clearing', rain: '30%' },
];

function renderWeather() {
  const strip = document.getElementById('weather-strip');
  if (!strip) return;
  strip.innerHTML = weatherForecast.map(w => `
    <div class="weather-card${w.today ? ' today' : ''}">
      <div class="wc-day">${w.day}</div>
      <div class="wc-icon">${w.icon}</div>
      <div class="wc-temp">${w.high}° / ${w.low}°</div>
      <div class="wc-desc">${w.desc}</div>
      <div class="wc-rain">🌧️ ${w.rain}</div>
    </div>
  `).join('');
}
renderWeather();

// ── MARKET PRICES ────────────────────────────────────────
const marketData = [
  { name: 'Rice (Paddy)', variety: 'Jyothi', price: 2240, change: +45, market: 'Tiruvalla', trend: [5,6,5,7,8,7,8] },
  { name: 'Coconut', variety: 'West Coast Tall', price: 32, change: +2, market: 'Haripad', trend: [4,5,6,5,7,6,7] },
  { name: 'Rubber', variety: 'RSS-4', price: 198, change: -3, market: 'Kottayam', trend: [8,7,6,7,6,5,5] },
  { name: 'Tapioca', variety: 'H-226', price: 18, change: +1, market: 'Thiruvalla', trend: [3,4,4,5,4,5,5] },
  { name: 'Banana', variety: 'Nendran', price: 54, change: +6, market: 'Ernakulam', trend: [4,5,5,6,7,7,8] },
  { name: 'Vegetables', variety: 'Mixed (kg)', price: 42, change: -8, market: 'Kochi', trend: [7,6,7,5,5,4,4] },
];

function renderMarket() {
  const tbody = document.getElementById('market-tbody');
  if (!tbody) return;
  tbody.innerHTML = marketData.map(row => {
    const up = row.change >= 0;
    const sparkBars = row.trend.map((v, i) => {
      const h = (v / 8) * 20;
      const isLast = i === row.trend.length - 1;
      return `<div class="spark-bar" style="height:${h}px;${isLast ? 'background:var(--green-light)' : ''}"></div>`;
    }).join('');
    return `<tr>
      <td><strong>${row.name}</strong></td>
      <td style="color:var(--text-muted)">${row.variety}</td>
      <td><strong>₹${row.price}/qtl</strong></td>
      <td class="${up ? 'price-up' : 'price-down'}">${up ? '▲' : '▼'} ₹${Math.abs(row.change)}</td>
      <td style="color:var(--text-muted)">${row.market}</td>
      <td><div class="sparkline">${sparkBars}</div></td>
    </tr>`;
  }).join('');
}
renderMarket();

// ── CTA FORM ─────────────────────────────────────────────
function ctaSubmit(e) {
  e.preventDefault();
  alert('Thank you! Our team will contact you within 24 hours to set up your free trial. 🌾');
  e.target.reset();
}

// ── HELPERS ──────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setClass(id, cls) {
  const el = document.getElementById(id);
  if (el) el.className = cls;
}

function updateSensorEl(id, base, range, fmt) {
  const el = document.getElementById(id);
  if (!el) return;
  const val = base + (Math.random() - 0.5) * range;
  el.textContent = fmt(val);
}
