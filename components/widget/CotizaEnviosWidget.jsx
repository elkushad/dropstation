import { useEffect } from 'react';

export default function CotizaEnviosWidget() {
  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS then run widget
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.onload = () => {
      const widgetScript = document.createElement('script');
      widgetScript.innerHTML = `
(function() {
  var TOKEN = 'token_vxtym37pb';
  var API_URL = 'https://envio-exacto-ruta.base44.app/api/functions/estimateShippingPublic';
  var SOLICITUD_URL = 'https://envio-exacto-ruta.base44.app/api/functions/crearSolicitud';

  var LOGOS = {
    indrive: 'https://media.base44.com/images/public/69bdcfc3a19c845fa0385dc4/e63453efb_Capturadepantalla2026-03-23113434.png',
    uber: 'https://media.base44.com/images/public/69bdcfc3a19c845fa0385dc4/82291a2fa_Capturadepantalla2026-03-23113137.png',
    cabify: 'https://media.base44.com/images/public/69bdcfc3a19c845fa0385dc4/f2431a232_Capturadepantalla2026-03-23113034.png'
  };

  var state = {
    step: 'address',
    address: '',
    lat: null,
    lng: null,
    geocoding: false,
    loadingQuotes: false,
    quotes: [],
    selected: null,
    map: null,
    marker: null
  };

  var DEFAULT_CENTER = [-12.0611, -77.0228];

  function $(id) { return document.getElementById(id); }

  var STYLES = \`
    #ce-wrap { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff; max-width: 480px; box-sizing: border-box; }
    #ce-wrap * { box-sizing: border-box; }
    #ce-header { background: #fff; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
    #ce-header-title { font-size: 13px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px; }
    #ce-close { background: none; border: none; cursor: pointer; font-size: 14px; color: #94a3b8; padding: 0; }
    #ce-body { padding: 14px 16px; }
    #ce-wrap label { display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .ce-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .ce-input { flex: 1; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; }
    .ce-input:focus { outline: none; border-color: #4f46e5; }
    .ce-btn-search { padding: 9px 14px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
    .ce-btn-search:disabled { opacity: 0.5; cursor: not-allowed; }
    .ce-hint { font-size: 10px; color: #94a3b8; margin-bottom: 8px; }
    #ce-map { width: 100%; height: 200px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
    .ce-coords { font-size: 10px; color: #94a3b8; text-align: center; margin-bottom: 8px; }
    .ce-btn-confirm { width: 100%; padding: 11px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .ce-btn-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
    .ce-back-link { font-size: 10px; color: #4f46e5; background: none; border: none; cursor: pointer; text-decoration: underline; margin-bottom: 10px; display: block; padding: 0; }
    .ce-confirmed-addr { display: flex; align-items: center; gap: 6px; background: #f8fafc; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; font-size: 10px; color: #64748b; }
    .ce-quote { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: 1px solid #e2e8f0; border-radius: 9px; margin-bottom: 7px; cursor: pointer; background: #fff; transition: border-color .15s; }
    .ce-quote.selected { border: 2px solid #4f46e5; background: #eef2ff; }
    .ce-quote img { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; }
    .ce-quote-name { font-weight: 700; font-size: 12px; color: #1e293b; }
    .ce-quote-info { font-size: 10px; color: #64748b; }
    .ce-quote-price { font-weight: 800; font-size: 14px; color: #4f46e5; margin-left: auto; }
    .ce-selected-badge { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px 10px; font-size: 11px; color: #4f46e5; font-weight: 600; margin-bottom: 6px; }
    .ce-success { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 16px; text-align: center; }
    .ce-success-icon { font-size: 30px; margin-bottom: 6px; }
    .ce-success p { font-size: 13px; color: #166534; font-weight: 700; margin: 0 0 4px; }
    .ce-success small { font-size: 11px; color: #4ade80; }
    .ce-powered { text-align: center; font-size: 10px; color: #cbd5e1; margin-top: 12px; }
    .ce-ref { text-align: center; font-size: 9px; color: #cbd5e1; margin-top: 2px; }
  \`;

  function initMap() {
    if (state.map) return;
    var mapEl = $('ce-map');
    if (!mapEl) return;
    var map = L.map('ce-map', { zoomControl: true, scrollWheelZoom: false }).setView(DEFAULT_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.on('click', function(e) { setMarker(map, e.latlng.lat, e.latlng.lng, true); });
    state.map = map;
    if (state.lat && state.lng) setMarker(map, state.lat, state.lng, false);
  }

  function setMarker(map, lat, lng, reverseGeo) {
    state.lat = lat; state.lng = lng;
    if (state.marker) map.removeLayer(state.marker);
    state.marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    state.marker.on('dragend', function(e) {
      var ll = e.target.getLatLng();
      setMarker(map, ll.lat, ll.lng, true);
    });
    updateCoords();
    if (reverseGeo) doReverseGeocode(lat, lng);
  }

  function updateCoords() {
    var el = $('ce-coords');
    if (el && state.lat) el.textContent = '📍 ' + state.lat.toFixed(5) + ', ' + state.lng.toFixed(5);
    var btn = $('ce-btn-confirm');
    if (btn) btn.disabled = !(state.lat && state.address.trim());
  }

  function doReverseGeocode(lat, lng) {
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.display_name) {
          state.address = d.display_name;
          var inp = $('ce-address-input');
          if (inp) inp.value = state.address;
          updateCoords();
        }
      }).catch(function() {});
  }

  function doGeocode() {
    if (!state.address.trim()) return;
    state.geocoding = true;
    renderSearchBtn();
    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(state.address) + '&limit=1')
      .then(function(r) { return r.json(); })
      .then(function(results) {
        state.geocoding = false;
        renderSearchBtn();
        if (results && results.length > 0) {
          var r = results[0];
          setMarker(state.map, parseFloat(r.lat), parseFloat(r.lon), false);
          state.address = r.display_name;
          var inp = $('ce-address-input');
          if (inp) inp.value = state.address;
          state.map.flyTo([state.lat, state.lng], 15, { duration: 1.2 });
          updateCoords();
        }
      }).catch(function() { state.geocoding = false; renderSearchBtn(); });
  }

  function renderSearchBtn() {
    var btn = $('ce-btn-search');
    if (!btn) return;
    btn.disabled = state.geocoding;
    btn.innerHTML = state.geocoding ? '⏳' : '🔍 Buscar';
  }

  function doConfirm() {
    if (!state.lat || !state.address.trim()) return;
    state.loadingQuotes = true;
    var btn = $('ce-btn-confirm');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Calculando tarifas...'; }
    fetch(API_URL, { method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ widget_token: TOKEN, destination_address: state.address,
        destination_lat: state.lat, destination_lng: state.lng, geocode_only: false }) })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        state.loadingQuotes = false;
        state.quotes = d.quotes || [];
        state.step = 'quotes';
        render();
      }).catch(function() {
        state.loadingQuotes = false;
        if (btn) { btn.disabled = false; btn.innerHTML = '✅ Confirmar dirección y ver tarifas'; }
      });
  }

  function doSend() {
    if (!state.selected) return;
    fetch(SOLICITUD_URL, { method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ widget_token: TOKEN, quote: state.selected,
        customer: { name: '', phone: '', email: '', address: state.address } }) })
      .then(function() { state.step = 'sent'; render(); })
      .catch(function() { state.step = 'sent'; render(); });
  }

  function render() {
    var container = $('cotiza-envios-widget');
    if (!container) return;
    var stepTitle = state.step === 'address' ? '¿Dónde te entregamos?' : state.step === 'quotes' ? 'Selecciona tu envío' : 'Envío confirmado';
    var html = '<style>' + STYLES + '</style><div id="ce-wrap">';
    html += '<div id="ce-header"><div id="ce-header-title">🚚 ' + stepTitle + '</div></div>';
    html += '<div id="ce-body">';
    if (state.step === 'address') html += renderAddress();
    else if (state.step === 'quotes') html += renderQuotes();
    else html += renderSent();
    html += '</div></div>';
    container.innerHTML = html;

    if (state.step === 'address') {
      var inp = $('ce-address-input');
      if (inp) {
        inp.value = state.address;
        inp.oninput = function() { state.address = this.value; updateCoords(); };
        inp.onkeydown = function(e) { if (e.key === 'Enter') doGeocode(); };
      }
      var searchBtn = $('ce-btn-search');
      if (searchBtn) searchBtn.onclick = doGeocode;
      var confirmBtn = $('ce-btn-confirm');
      if (confirmBtn) { confirmBtn.onclick = doConfirm; confirmBtn.disabled = !(state.lat && state.address.trim()); }
      setTimeout(initMap, 50);
    }
    if (state.step === 'quotes') {
      document.querySelectorAll('.ce-quote').forEach(function(el) {
        el.onclick = function() {
          var app = this.getAttribute('data-app');
          state.selected = state.quotes.find(function(q) { return q.delivery_app === app; });
          render();
        };
      });
      var backBtn = $('ce-back');
      if (backBtn) backBtn.onclick = function() { state.step = 'address'; state.selected = null; render(); setTimeout(initMap, 50); };
      var sendBtn = $('ce-send');
      if (sendBtn) sendBtn.onclick = doSend;
    }
    if (state.step === 'sent') {
      var resetBtn = $('ce-reset');
      if (resetBtn) resetBtn.onclick = function() { state.step = 'address'; state.selected = null; state.quotes = []; state.lat = null; state.lng = null; state.address = ''; state.marker = null; state.map = null; render(); setTimeout(initMap, 50); };
    }
  }

  function renderAddress() {
    return '<label>Dirección de entrega <span style="color:#f87171">*</span></label>' +
      '<div class="ce-row"><input id="ce-address-input" class="ce-input" placeholder="Ej: Av. Javier Prado 1234, San Isidro" />' +
      '<button id="ce-btn-search" class="ce-btn-search">🔍 Buscar</button></div>' +
      '<p class="ce-hint">Haz clic en el mapa para ajustar tu ubicación exacta.</p>' +
      '<div id="ce-map"></div>' +
      '<p id="ce-coords" class="ce-coords"></p>' +
      '<button id="ce-btn-confirm" class="ce-btn-confirm" disabled>✅ Confirmar dirección y ver tarifas</button>' +
      '<p class="ce-powered">Powered by <b>CotizaEnvios.com</b></p>' +
      '<p class="ce-ref">*Costo de envío referencial · no se añade al total de tu compra*</p>';
  }

  function renderQuotes() {
    var qs = state.quotes.map(function(q) {
      var sel = state.selected && state.selected.delivery_app === q.delivery_app;
      return '<div class="ce-quote' + (sel ? ' selected' : '') + '" data-app="' + q.delivery_app + '">' +
        '<img src="' + (LOGOS[q.delivery_app] || '') + '" alt="' + q.delivery_app_name + '">' +
        '<div><div class="ce-quote-name">' + q.delivery_app_name + '</div>' +
        '<div class="ce-quote-info">' + (q.vehicle_type === 'motorcycle' ? '🏍️' : '🚗') + ' ' + (q.vehicle_name || '') + ' · ⏱️ ' + q.estimated_time_minutes + ' min</div></div>' +
        '<div class="ce-quote-price">S/ ' + Number(q.estimated_cost_soles).toFixed(2) + '</div></div>';
    }).join('');
    var sel = state.selected ? '<div class="ce-selected-badge">✓ ' + state.selected.delivery_app_name + ' seleccionado</div>' : '';
    return '<button id="ce-back" class="ce-back-link">← Cambiar dirección</button>' +
      '<div class="ce-confirmed-addr">📍 ' + state.address.substring(0, 50) + '...</div>' +
      qs + sel +
      '<button id="ce-send" class="ce-btn-confirm" ' + (!state.selected ? 'disabled' : '') + '>' +
      (state.selected ? '✅ Confirmar envío con ' + state.selected.delivery_app_name : 'Selecciona una opción') +
      '</button>' +
      '<p class="ce-powered">Powered by <b>CotizaEnvios.com</b></p>' +
      '<p class="ce-ref">*Costo de envío referencial · no se añade al total de tu compra*</p>';
  }

  function renderSent() {
    return '<div class="ce-success">' +
      '<div class="ce-success-icon">✅</div>' +
      '<p>¡Envío confirmado!</p>' +
      '<small>El vendedor coordinará tu entrega con ' + (state.selected ? state.selected.delivery_app_name : '') + '</small>' +
      '</div>' +
      '<button id="ce-reset" class="ce-back-link" style="margin-top:10px;text-align:center;width:100%">↺ Hacer otra consulta</button>' +
      '<p class="ce-powered">Powered by <b>CotizaEnvios.com</b></p>';
  }

  render();
  setTimeout(initMap, 100);
})();
      `;
      document.body.appendChild(widgetScript);
    };
    document.body.appendChild(leafletScript);

    return () => {
      // cleanup
      const el = document.getElementById('cotiza-envios-widget');
      if (el) el.innerHTML = '';
    };
  }, []);

  return <div id="cotiza-envios-widget" />;
}