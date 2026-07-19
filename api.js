// ============================================================================
// TimeWise EMS2 — api.js  (M3)
// Load order in every page:  config.js  →  api.js  →  page script
// Provides: window.EMS2 (client + auth + banner) and window.EMS2.callAPI.
// Each page's own callAPI() body is patched to delegate here — page logic,
// field names and UI stay exactly as before.
// ============================================================================
(function () {
  'use strict';

  // ---- 1. Load supabase-js v2 (CDN) and create the client -------------------
  var _client = null;
  var _ready = new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = function () {
      try {
        _client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        resolve(_client);
      } catch (e) { reject(e); }
    };
    s.onerror = function () { reject(new Error('Could not load Supabase library. Check internet.')); };
    document.head.appendChild(s);
  });

  // ---- 2. Session bridge -----------------------------------------------------
  // Pages keep using localStorage 'timewise_session'. We refresh its timestamp
  // whenever a valid Supabase session exists so their expiry checks pass, and
  // enrich it after every init* call.
  function readTW() {
    try { return JSON.parse(localStorage.getItem('timewise_session') || 'null'); }
    catch (e) { return null; }
  }
  function writeTW(patch) {
    var cur = readTW() || {};
    Object.assign(cur, patch, { timestamp: Date.now() });
    localStorage.setItem('timewise_session', JSON.stringify(cur));
    return cur;
  }

  async function getAuthedEmail() {
    var c = await _ready;
    var res = await c.auth.getSession();
    var session = res.data ? res.data.session : null;
    return session && session.user ? String(session.user.email || '').toLowerCase() : null;
  }

  // Refresh the bridge as early as possible (before page scripts run their init)
  var _bridge = (async function () {
    try {
      var email = await getAuthedEmail();
      if (email) {
        var tw = readTW();
        if (tw && tw.employeeEmail === email) writeTW({});           // just bump timestamp
        else if (!tw || tw.employeeEmail !== email) writeTW({ employeeEmail: email });
      } else {
        localStorage.removeItem('timewise_session');
      }
      return email;
    } catch (e) { return null; }
  })();

  // ---- 3. OTP auth helpers (used by home.html's login UI) --------------------
  async function sendOtp(email) {
    var c = await _ready;
    var r = await c.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true } });
    if (r.error) throw new Error(cleanErr(r.error.message));
  }
  async function verifyOtp(email, code) {
    var c = await _ready;
    var r = await c.auth.verifyOtp({ email: email, token: String(code).trim(), type: 'email' });
    if (r.error) throw new Error(cleanErr(r.error.message));
    writeTW({ employeeEmail: String(email).toLowerCase() });
  }
  async function signOut() {
    try { var c = await _ready; await c.auth.signOut(); } catch (e) {}
    localStorage.removeItem('timewise_session');
  }
  function cleanErr(msg) {
    msg = String(msg || 'Something went wrong');
    if (/not registered/i.test(msg)) return 'This email is not registered with DRP EMS. Contact the admin.';
    if (/rate limit|security purposes/i.test(msg)) return 'Please wait a minute before requesting another code.';
    if (/expired|invalid/i.test(msg) && /token|otp/i.test(msg)) return 'That code is wrong or expired. Request a new one.';
    return msg.replace(/^.*?exception:\s*/i, '');
  }

  // ---- 4. callAPI shim ---------------------------------------------------------
  async function callAPI(action, params) {
    params = params || {};
    var c = await _ready;
    await _bridge;

    if (action === 'initWorkPlanDashboard') {
      var raw = await rpc(c, action, params);
      return { gridData: buildGridData(raw) };
    }
    var data = await rpc(c, action, params);

    // Keep the localStorage session enriched exactly like the old backend did
    if (/^init/i.test(action) && data && typeof data === 'object') {
      var patch = {};
      if (data.employee)                patch.employeeData = data.employee;
      if (typeof data.isApprover === 'boolean') patch.isApprover = data.isApprover;
      if (Object.keys(patch).length) writeTW(patch);
    }
    return data;
  }

  async function rpc(c, action, params) {
    var fn = ('api_' + action).toLowerCase();      // PG folds unquoted names to lowercase
    var r = await c.rpc(fn, { p: params });
    if (r.error) {
      if (/JWT|not authenticated|401/i.test(r.error.message || '')) {
        await signOut();
        if (!/home\.html|\/$/.test(location.pathname)) location.href = 'home.html?next=app';
      }
      throw new Error(cleanErr(r.error.message));
    }
    return r.data;
  }

  // ---- 5. Team grid builder (initWorkPlanDashboard) -----------------------------
  function buildGridData(raw) {
    var today = raw.today;                                  // 'yyyy-mm-dd'
    var DAYN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var MON  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function addDays(iso, n) {
      var d = new Date(iso + 'T00:00:00');
      d.setDate(d.getDate() + n);
      var m = (d.getMonth() + 1), day = d.getDate();
      return { iso: d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day, d: d };
    }
    var globalHol = {}, personalHol = {};
    (raw.holidays || []).forEach(function (h) {
      var scope = String(h['Employee Email'] || 'All');
      if (/^all$/i.test(scope)) globalHol[h.Date] = h.Description || 'Holiday';
      else {
        personalHol[scope.toLowerCase()] = personalHol[scope.toLowerCase()] || {};
        personalHol[scope.toLowerCase()][h.Date] = h.Description || 'Holiday';
      }
    });
    var dates = [];
    for (var i = 0; i < 30; i++) {
      var x = addDays(today, i);
      dates.push({
        dateStr: x.iso, dayNum: x.d.getDate(), dayName: DAYN[x.d.getDay()],
        monthShort: MON[x.d.getMonth()],
        isSunday: x.d.getDay() === 0,
        isHoliday: !!globalHol[x.iso],
        holidayName: globalHol[x.iso] || null,
        isToday: i === 0
      });
    }
    var rowsByEmail = {};
    (raw.teamRows || []).forEach(function (w) {
      var em = String(w['Employee Email'] || '').toLowerCase();
      (rowsByEmail[em] = rowsByEmail[em] || []).push(w);
    });
    var leavesByEmail = {};
    (raw.leaves || []).forEach(function (l) {
      var em = String(l.email || '').toLowerCase();
      (leavesByEmail[em] = leavesByEmail[em] || []).push(l);
    });
    var employees = (raw.employees || []).map(function (e) {
      var em = String(e.email || '').toLowerCase();
      var myRows = rowsByEmail[em] || [];
      var myLv = leavesByEmail[em] || [];
      var pHol = personalHol[em] || {};
      var days = dates.map(function (d) {
        var isLeave = myLv.some(function (l) { return d.dateStr >= l.fromDate && d.dateStr <= l.toDate; });
        var offDay = d.isSunday || d.isHoliday || !!pHol[d.dateStr];
        var entries = [];
        if (!isLeave) {
          myRows.forEach(function (w) {
            if (d.dateStr < w['From Date'] || d.dateStr > w['To Date']) return;
            var incl = String(w['Include Off Days'] || 'No') === 'Yes';
            if (offDay && !incl) return;
            entries.push({
              client: w['Client'] || '', task: w['Task'] || '',
              description: w['Description'] || '',
              hours: Number(w['Daily Hours']) || 0,
              location: w['Location'] || ''
            });
          });
        }
        var total = entries.reduce(function (s, en) { return s + en.hours; }, 0);
        return { entries: entries, totalHours: Math.round(total * 100) / 100, isLeave: isLeave };
      });
      return { name: e.name, days: days };
    });
    return { dates: dates, employees: employees };
  }

  // ---- 6. Test-portal ribbon + announcements banner -------------------------------
  function injectBanner() {
    try {
      if (CONFIG.IS_TEST_PORTAL) {
        var bar = document.createElement('div');
        bar.setAttribute('style', 'position:sticky;top:0;z-index:99998;background:#d4a853;color:#102a43;text-align:center;font:600 12px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:6px 10px;');
        bar.textContent = 'TEST PORTAL — ems2 · entries here are NOT real · live portal: ems.drpca.com';
        document.body.prepend(bar);
      }
      _ready.then(function (c) {
        return c.from('announcements').select('message,severity').eq('active', true);
      }).then(function (r) {
        if (!r || r.error || !r.data || !r.data.length) return;
        r.data.forEach(function (a) {
          var el = document.createElement('div');
          var imp = a.severity === 'important';
          el.setAttribute('style', 'position:sticky;top:0;z-index:99997;text-align:center;font:500 13px Inter,sans-serif;padding:8px 12px;' +
            (imp ? 'background:#7a2e1d;color:#fff;' : 'background:#f0f4f8;color:#102a43;border-bottom:1px solid #d9e2ec;'));
          el.textContent = a.message;
          document.body.prepend(el);
        });
      }).catch(function () {});
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectBanner);
  else injectBanner();

  // ---- 7. Export -------------------------------------------------------------------
  window.EMS2 = {
    ready: _ready, callAPI: callAPI, sendOtp: sendOtp, verifyOtp: verifyOtp,
    signOut: signOut, getAuthedEmail: getAuthedEmail, session: readTW,
    client: function () { return _client; }
  };
})();
