'use strict';

var state = {};
var calls = [];

var DEFAULTS_URL = 'data.json';
var STORAGE_KEY = 'communic8_data';

function loadState() {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { state = JSON.parse(saved); return; } catch(e) {}
  }
  fetch(DEFAULTS_URL)
    .then(function(r){ return r.json(); })
    .then(function(d){ state = d; initAll(); })
    .catch(function(){
      state = getHardDefaults();
      initAll();
    });
}

function getHardDefaults() {
  return {
    pitch: '"Hi, my name is Chris — I work with people who feel stuck or unfulfilled despite doing all the right things. I offer a free, no-obligation coaching session over Zoom — no credit card, no strings attached. Would that be of any interest to you?"',
    weekCards: [
      { hours: 5, label: 'Cold calling' },
      { hours: 2, label: 'Planning sessions' },
      { hours: 3, label: 'Working on business' }
    ],
    prepTasks: [
      { label: 'Review and refresh your prospect list', sub: 'Ensure all numbers have been washed against the ACMA Do Not Call Register', done: false },
      { label: 'Rehearse your opening pitch out loud', sub: 'Say it naturally — not recited. Adjust tone until it feels genuine', done: false },
      { label: 'Set your daily call target', sub: 'Aim for 20 calls per session. Write the number down before you start', done: false },
      { label: 'Charge your phone', sub: 'Full battery before you leave. Bring a portable charger as backup', done: false },
      { label: 'Download prospect list offline', sub: 'Export your list so it is accessible without relying on mobile data', done: false },
      { label: 'Clear your mind before starting', sub: 'Five minutes of stillness before call one. The mountains help with this', done: false }
    ],
    setupTasks: [
      { label: 'Phone — fully charged', sub: 'Your primary calling device', done: false },
      { label: 'Portable charger', sub: '5-hour sessions drain the battery — do not risk it', done: false },
      { label: 'Notebook and pen', sub: 'For jotting notes mid-call when you cannot type fast enough', done: false },
      { label: 'Water', sub: 'Voice work is dehydrating — bring a full bottle', done: false },
      { label: 'Snack', sub: 'For the mid-session check-in break', done: false },
      { label: 'Earphones', sub: 'Hands-free makes note-taking easier and sounds more natural', done: false },
      { label: 'Jacket / weather layer', sub: 'Belgrave can be cool — comfort affects your voice', done: false }
    ],
    locationFields: [
      { id: 'loc-primary', label: 'Primary location', type: 'input', value: 'Belgrave — quiet area near the Dandenong Ranges' },
      { id: 'loc-setting', label: 'Setting description', type: 'input', value: 'Park near the mountains — outdoors, low foot traffic, good mobile signal' },
      { id: 'loc-why', label: 'Why this location works', type: 'input', value: 'Natural, calm, away from the city — suits the mindset for this work' },
      { divider: true },
      { id: 'loc-travel-header', type: 'header', value: 'Getting there' },
      { id: 'loc-train', label: 'By train', type: 'textarea', value: 'Belgrave line from Flinders Street — terminus is Belgrave Station. Walk or short taxi to the park.' },
      { id: 'loc-car', label: 'By car', type: 'textarea', value: 'Monash Freeway east, exit at Belgrave. Parking available near the park area.' },
      { id: 'loc-notes', label: 'Travel notes', type: 'textarea', value: 'Check mobile coverage before committing (Telstra tends to be strongest in the ranges). Arrive 10 min early to settle before the first call.' },
      { id: 'loc-backup', label: 'Backup location', type: 'input', value: '' }
    ],
    amenities: [
      { label: 'Cafes', value: "Several cafes on Belgrave's main strip — good for a pre-session coffee" },
      { label: 'Toilets', value: 'Public amenities near Belgrave Station' },
      { label: 'Shops', value: 'Small supermarket for any last-minute supplies' },
      { label: 'Shelter', value: 'Covered picnic areas in the park if weather turns' }
    ],
    prospects: [],
    numCalls: 20,
    checkins: [
      { title: 'After call 15' },
      { title: 'After call 30' },
      { title: 'After call 45' }
    ]
  };
}

function saveData() {
  syncStateFromDOM();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  var s = document.getElementById('save-status');
  s.textContent = '✓ Saved';
  setTimeout(function(){ s.textContent = ''; }, 2000);
}

function syncStateFromDOM() {
  var p = document.getElementById('pitch-text');
  if (p) state.pitch = p.value;

  var wc = document.querySelectorAll('.week-card');
  wc.forEach(function(card, i) {
    if (!state.weekCards[i]) return;
    var h = card.querySelector('.week-hrs-input');
    var l = card.querySelector('.week-label-input');
    if (h) state.weekCards[i].hours = parseInt(h.value) || 0;
    if (l) state.weekCards[i].label = l.value;
  });

  state.locationFields.forEach(function(f) {
    if (!f.id || f.type === 'header') return;
    var el = document.getElementById(f.id);
    if (el) f.value = el.value;
  });
}

function exportData() {
  syncStateFromDOM();
  var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'communic8-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function switchTab(t) {
  document.querySelectorAll('.tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === t);
  });
  document.querySelectorAll('.tab-panel').forEach(function(p) {
    p.classList.toggle('active', p.id === 'tab-' + t);
  });
}

function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function initAll() {
  renderWeekCards();
  renderTasks('prep-task-list', state.prepTasks, 'prep');
  renderTasks('setup-task-list', state.setupTasks, 'setup');
  var pt = document.getElementById('pitch-text');
  if (pt) pt.value = state.pitch || '';
  renderLocationFields();
  renderAmenities();
  renderProspects();
  var nci = document.getElementById('num-calls-input');
  if (nci) nci.value = state.numCalls || 20;
  buildCalls();
  renderCheckins();
}

function renderWeekCards() {
  var g = document.getElementById('week-grid');
  if (!g) return;
  g.innerHTML = '';
  (state.weekCards || []).forEach(function(c, i) {
    var d = document.createElement('div');
    d.className = 'week-card';
    d.innerHTML =
      '<input class="week-hrs-input" type="number" min="0" max="100" value="' + esc(String(c.hours)) + '" oninput="state.weekCards[' + i + '].hours=parseInt(this.value)||0">' +
      '<div class="week-unit">hrs / week</div>' +
      '<input class="week-label-input" type="text" value="' + esc(c.label) + '" oninput="state.weekCards[' + i + '].label=this.value">';
    g.appendChild(d);
  });
}

function renderTasks(listId, tasks, key) {
  var ul = document.getElementById(listId);
  if (!ul) return;
  ul.innerHTML = '';
  tasks.forEach(function(t, i) {
    var li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML =
      '<input type="checkbox"' + (t.done ? ' checked' : '') + ' onchange="toggleTask(\'' + key + '\',' + i + ',this.checked)">' +
      '<div class="task-content">' +
        '<input class="task-main-input' + (t.done ? ' done' : '') + '" type="text" value="' + esc(t.label) + '" oninput="editTask(\'' + key + '\',' + i + ',\'label\',this.value)">' +
        '<input class="task-sub-input" type="text" value="' + esc(t.sub) + '" placeholder="Add a note..." oninput="editTask(\'' + key + '\',' + i + ',\'sub\',this.value)">' +
      '</div>' +
      '<button class="task-del" onclick="removeTask(\'' + key + '\',' + i + ')" aria-label="Remove">✕</button>';
    ul.appendChild(li);
  });
}

function toggleTask(key, i, checked) {
  var arr = key === 'prep' ? state.prepTasks : state.setupTasks;
  arr[i].done = checked;
  renderTasks(key === 'prep' ? 'prep-task-list' : 'setup-task-list', arr, key);
}

function editTask(key, i, field, val) {
  var arr = key === 'prep' ? state.prepTasks : state.setupTasks;
  arr[i][field] = val;
}

function removeTask(key, i) {
  var arr = key === 'prep' ? state.prepTasks : state.setupTasks;
  arr.splice(i, 1);
  renderTasks(key === 'prep' ? 'prep-task-list' : 'setup-task-list', arr, key);
}

function addTask(key) {
  var arr = key === 'prep' ? state.prepTasks : state.setupTasks;
  arr.push({ label: 'New task', sub: '', done: false });
  renderTasks(key === 'prep' ? 'prep-task-list' : 'setup-task-list', arr, key);
}

function renderLocationFields() {
  var c = document.getElementById('location-fields');
  if (!c) return;
  c.innerHTML = '';
  (state.locationFields || []).forEach(function(f) {
    if (f.divider) {
      var hr = document.createElement('hr');
      hr.className = 'field-divider';
      c.appendChild(hr);
      return;
    }
    if (f.type === 'header') {
      var h = document.createElement('div');
      h.style.cssText = 'font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px;margin-top:4px';
      h.textContent = f.value;
      c.appendChild(h);
      return;
    }
    var wrap = document.createElement('div');
    wrap.className = 'location-field';
    var lbl = document.createElement('label');
    lbl.className = 'field-label';
    lbl.textContent = f.label || '';
    wrap.appendChild(lbl);
    var el;
    if (f.type === 'textarea') {
      el = document.createElement('textarea');
      el.rows = 2;
    } else {
      el = document.createElement('input');
      el.type = 'text';
    }
    el.className = 'field-input';
    el.id = f.id;
    el.value = f.value || '';
    el.placeholder = f.placeholder || '';
    el.addEventListener('input', function() { f.value = el.value; });
    wrap.appendChild(el);
    c.appendChild(wrap);
  });
}

function renderAmenities() {
  var g = document.getElementById('amenities-grid');
  if (!g) return;
  g.innerHTML = '';
  (state.amenities || []).forEach(function(a, i) {
    var d = document.createElement('div');
    d.className = 'amenity-card';
    d.innerHTML =
      '<input class="amenity-label-input" type="text" value="' + esc(a.label) + '" oninput="state.amenities[' + i + '].label=this.value">' +
      '<input class="amenity-val-input" type="text" value="' + esc(a.value) + '" placeholder="Description..." oninput="state.amenities[' + i + '].value=this.value">' +
      '<button class="amenity-del" onclick="removeAmenity(' + i + ')" aria-label="Remove amenity">✕</button>';
    g.appendChild(d);
  });
}

function addAmenity() {
  state.amenities.push({ label: 'New amenity', value: '' });
  renderAmenities();
}

function removeAmenity(i) {
  state.amenities.splice(i, 1);
  renderAmenities();
}

function addProspect() {
  var n = document.getElementById('p-name').value.trim();
  var num = document.getElementById('p-number').value.trim();
  var src = document.getElementById('p-source').value.trim();
  if (!n || !num) return;
  if (!state.prospects) state.prospects = [];
  state.prospects.push({ name: n, number: num, source: src || '—', washed: false, status: 'pending' });
  document.getElementById('p-name').value = '';
  document.getElementById('p-number').value = '';
  document.getElementById('p-source').value = '';
  renderProspects();
}

function renderProspects() {
  var empty = document.getElementById('prospect-empty');
  var table = document.getElementById('prospect-table');
  var note = document.getElementById('acma-note');
  var ps = state.prospects || [];
  if (ps.length === 0) {
    empty.style.display = 'block'; table.style.display = 'none'; note.style.display = 'none';
    return;
  }
  empty.style.display = 'none'; table.style.display = 'table'; note.style.display = 'block';
  document.getElementById('prospect-body').innerHTML = ps.map(function(p, i) {
    var wb = p.washed
      ? '<span class="badge badge-washed" onclick="toggleWash(' + i + ')" title="Click to toggle">Washed</span>'
      : '<span class="badge badge-pending" onclick="toggleWash(' + i + ')" title="Click to toggle">Unwashed</span>';
    return '<tr>' +
      '<td style="color:var(--text-3);font-size:12px">' + (i + 1) + '</td>' +
      '<td><input type="text" value="' + esc(p.name) + '" oninput="state.prospects[' + i + '].name=this.value"></td>' +
      '<td><input type="tel" value="' + esc(p.number) + '" oninput="state.prospects[' + i + '].number=this.value"></td>' +
      '<td><input type="text" value="' + esc(p.source) + '" oninput="state.prospects[' + i + '].source=this.value"></td>' +
      '<td>' + wb + '</td>' +
      '<td><select class="outcome-sel" onchange="state.prospects[' + i + '].status=this.value;renderProspects()">' +
        '<option value="pending"' + (p.status === 'pending' ? ' selected' : '') + '>Pending</option>' +
        '<option value="called"' + (p.status === 'called' ? ' selected' : '') + '>Called</option>' +
        '<option value="booked"' + (p.status === 'booked' ? ' selected' : '') + '>Booked</option>' +
      '</select></td>' +
      '<td><button class="task-del" onclick="removeProspect(' + i + ')" aria-label="Remove">✕</button></td>' +
    '</tr>';
  }).join('');
}

function toggleWash(i) {
  state.prospects[i].washed = !state.prospects[i].washed;
  renderProspects();
}

function removeProspect(i) {
  state.prospects.splice(i, 1);
  renderProspects();
}

function markAllWashed() {
  (state.prospects || []).forEach(function(p) { p.washed = true; });
  renderProspects();
}

function clearProspects() {
  if (confirm('Clear all prospects? This cannot be undone.')) {
    state.prospects = [];
    renderProspects();
  }
}

function emailList() {
  var ps = state.prospects || [];
  if (ps.length === 0) { alert('No prospects yet.'); return; }
  var body = 'Prospect list — ' + new Date().toLocaleDateString('en-AU') + '\n\n';
  body += ps.map(function(p, i) {
    return (i + 1) + '. ' + p.name + ' | ' + p.number + ' | ' + p.source + ' | Washed: ' + (p.washed ? 'Yes' : 'No') + ' | ' + p.status;
  }).join('\n');
  window.open('mailto:?subject=Prospect list ' + new Date().toLocaleDateString('en-AU') + '&body=' + encodeURIComponent(body));
}

function buildCalls() {
  var n = parseInt((document.getElementById('num-calls-input') || {}).value) || state.numCalls || 20;
  state.numCalls = n;
  calls = [];
  var tbody = document.getElementById('call-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (var i = 0; i < n; i++) {
    calls.push({ name: '', opened: false, pace: false, tone: false, spoke: false, nextstep: false, outcome: '—' });
    var tr = document.createElement('tr');
    var idx = i;
    tr.innerHTML =
      '<td class="left" style="color:var(--text-3);font-size:11px">' + (i + 1) + '</td>' +
      '<td class="left"><input class="call-name-input" type="text" placeholder="Name" oninput="calls[' + idx + '].name=this.value"></td>' +
      '<td><input type="checkbox" onchange="updateCall(' + idx + ',\'opened\',this.checked)"></td>' +
      '<td><input type="checkbox" onchange="updateCall(' + idx + ',\'pace\',this.checked)"></td>' +
      '<td><input type="checkbox" onchange="updateCall(' + idx + ',\'tone\',this.checked)"></td>' +
      '<td><input type="checkbox" onchange="updateCall(' + idx + ',\'spoke\',this.checked)"></td>' +
      '<td><input type="checkbox" onchange="updateCall(' + idx + ',\'nextstep\',this.checked)"></td>' +
      '<td><select class="call-outcome-sel" onchange="updateCallOutcome(' + idx + ',this.value)">' +
        '<option>—</option><option>VM</option><option>NA</option><option>Spoke</option><option>NS</option>' +
      '</select></td>';
    tbody.appendChild(tr);
  }
  updateStats();
}

function rebuildCalls() {
  var v = parseInt(document.getElementById('num-calls-input').value) || 20;
  state.numCalls = v;
  buildCalls();
  renderCheckins();
}

function updateCall(i, f, v) { if (calls[i]) { calls[i][f] = v; } updateStats(); }
function updateCallOutcome(i, v) { if (calls[i]) { calls[i].outcome = v; } updateStats(); }

function updateStats() {
  var logged = calls.filter(function(c) { return c.outcome !== '—'; }).length;
  var spoke = calls.filter(function(c) { return c.outcome === 'Spoke' || c.outcome === 'NS'; }).length;
  var ns = calls.filter(function(c) { return c.outcome === 'NS'; }).length;
  var rate = logged > 0 ? Math.round(spoke / logged * 100) : 0;
  document.getElementById('stat-total').textContent = logged;
  document.getElementById('stat-spoke').textContent = spoke;
  document.getElementById('stat-ns').textContent = ns;
  document.getElementById('stat-rate').textContent = rate + '%';
}

function renderCheckins() {
  var g = document.getElementById('checkin-grid');
  if (!g) return;
  g.innerHTML = '';
  (state.checkins || []).forEach(function(c, ci) {
    var d = document.createElement('div');
    d.className = 'checkin-card';
    d.innerHTML =
      '<input class="checkin-title-input" type="text" value="' + esc(c.title) + '" oninput="state.checkins[' + ci + '].title=this.value">' +
      '<div class="checkin-row"><span class="checkin-row-label">Energy</span><div class="checkin-opts"><button class="ci-btn" onclick="selCI(this)">Low</button><button class="ci-btn" onclick="selCI(this)">OK</button><button class="ci-btn" onclick="selCI(this)">Good</button></div></div>' +
      '<div class="checkin-row"><span class="checkin-row-label">Voice</span><div class="checkin-opts"><button class="ci-btn" onclick="selCI(this)">Tight</button><button class="ci-btn" onclick="selCI(this)">OK</button><button class="ci-btn" onclick="selCI(this)">Flowing</button></div></div>' +
      '<div class="checkin-row"><span class="checkin-row-label">Action</span><div class="checkin-opts"><button class="ci-btn" onclick="selCI(this)">Keep going</button><button class="ci-btn" onclick="selCI(this)">Take 5</button></div></div>' +
      '<button class="checkin-del" onclick="removeCheckin(' + ci + ')" aria-label="Remove check-in">✕</button>';
    g.appendChild(d);
  });
}

function selCI(btn) {
  btn.parentElement.querySelectorAll('.ci-btn').forEach(function(b) { b.classList.remove('sel'); });
  btn.classList.add('sel');
}

function addCheckin() {
  var n = (state.checkins || []).length;
  state.checkins.push({ title: 'After call ' + ((n + 1) * 15) });
  renderCheckins();
}

function removeCheckin(i) {
  state.checkins.splice(i, 1);
  renderCheckins();
}

document.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { state = JSON.parse(saved); initAll(); return; } catch(e) {}
  }
  fetch(DEFAULTS_URL)
    .then(function(r) { return r.json(); })
    .then(function(d) { state = d; initAll(); })
    .catch(function() { state = getHardDefaults(); initAll(); });
});

window.addEventListener('beforeunload', function() {
  syncStateFromDOM();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});
