/* ==========================================================
   ui.js — everything that touches the DOM after analysis:
   progress bar, error message, ATS ring, result cards, toast.
   User-derived text is always inserted with textContent
   (never innerHTML), so a malicious file cannot inject markup.
   ========================================================== */
(function (root) {
  'use strict';
  var HB = root.HB = root.HB || {};
  var ui = HB.ui = {};

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- progress / error / toast ---------- */

  ui.showProgress = function (pct, msg) {
    $('progressWrap').style.display = 'block';
    $('progressBar').style.width = pct + '%';
    $('progressLabel').textContent = msg;
  };

  ui.hideProgress = function () {
    $('progressWrap').style.display = 'none';
    $('progressBar').style.width = '0%';
  };

  ui.showError = function (msg) {
    var box = $('errorMsg');
    box.textContent = msg;
    box.hidden = false;
  };

  ui.clearError = function () {
    var box = $('errorMsg');
    box.textContent = '';
    box.hidden = true;
  };

  var toastTimer = null;
  ui.toast = function (msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  };

  /* ---------- ATS ring ---------- */

  var ringTimer = null;

  function animateATS(target) {
    var stroke = $('atsStroke');
    var label = $('atsCircleLabel');
    var fill = $('atsFill');
    var r = parseFloat(stroke.getAttribute('r'));
    var circumference = 2 * Math.PI * r;

    clearInterval(ringTimer);
    stroke.style.strokeDasharray = circumference;
    stroke.style.strokeDashoffset = circumference;
    label.textContent = '0%';
    fill.style.width = '0%';
    requestAnimationFrame(function () { fill.style.width = target + '%'; });

    var current = 0;
    var step = Math.max(target / 50, 0.5);
    ringTimer = setInterval(function () {
      current += step;
      if (current >= target) { current = target; clearInterval(ringTimer); }
      stroke.style.strokeDashoffset = circumference * (1 - current / 100);
      label.textContent = Math.round(current) + '%';
    }, 15);
  }

  /* ---------- building blocks ---------- */

  function card(icon, title, nodes, extraClass) {
    var c = el('div', 'card' + (extraClass ? ' ' + extraClass : ''));
    c.appendChild(el('div', 'ico', icon));
    var body = el('div', 'card-body');
    body.appendChild(el('h4', null, title));
    nodes.forEach(function (n) { body.appendChild(n); });
    c.appendChild(body);
    return c;
  }

  function chips(items, cls) {
    var wrap = el('div', 'chips');
    items.forEach(function (name) { wrap.appendChild(el('span', 'chip' + (cls ? ' ' + cls : ''), name)); });
    return wrap;
  }

  function list(items, ordered) {
    var l = el(ordered ? 'ol' : 'ul', 'list');
    items.forEach(function (t) { l.appendChild(el('li', null, t)); });
    return l;
  }

  /* ---------- sections ---------- */

  function renderBreakdown(checks) {
    var box = $('atsBreakdown');
    box.textContent = '';
    var icons = { pass: '✅', warn: '⚠️', fail: '❌' };
    checks.forEach(function (c) {
      var row = el('div', 'check');
      row.appendChild(el('div', 'state', icons[c.status]));
      var txt = el('div');
      txt.appendChild(el('div', 'name', c.label));
      if (c.status !== 'pass') txt.appendChild(el('div', 'tip', c.tip));
      row.appendChild(txt);
      row.appendChild(el('div', 'pts', c.score + ' / ' + c.max));
      box.appendChild(row);
    });
  }

  function skillsCard(r) {
    var nodes = [];
    if (!r.skills.length) {
      nodes.push(el('p', null, 'No recognisable skills were found. Add a "Skills" section that lists your tools and technologies.'));
    } else {
      HB.CATEGORY_ORDER.forEach(function (cat) {
        var names = r.skills.filter(function (s) { return s.category === cat; }).map(function (s) { return s.name; });
        if (!names.length) return;
        nodes.push(el('div', 'cat-label', cat));
        nodes.push(chips(names, cat === 'Soft Skills' ? 'soft' : ''));
      });
    }
    return card('🛠️', 'Extracted Skills (' + r.skills.length + ')', nodes, 'wide');
  }

  function roleCard(r) {
    var nodes = [];
    if (r.lowConfidence) {
      nodes.push(el('div', 'big', 'Not enough signal'));
      nodes.push(el('p', null, 'Too few recognisable skills to predict a role confidently. Showing ' + r.role.title + ' skills as a starting point.'));
    } else {
      nodes.push(el('div', 'big', r.role.currentTitle));
      nodes.push(el('p', null, 'Best fit: ' + r.role.title + ' · ' + r.level.label));
    }
    if (r.role.alternatives.length) {
      nodes.push(el('div', 'sub', 'Also close: ' + r.role.alternatives.map(function (a) { return a.title + ' (' + a.score + '%)'; }).join(', ')));
    }
    return card('👔', 'Predicted Job Role', nodes);
  }

  function matchCard(r) {
    var m = r.match;
    var bar = el('div', 'mini-bar');
    var fill = el('span');
    fill.style.width = m.score + '%';
    bar.appendChild(fill);
    var nodes = [
      el('div', 'big', m.score + '%'),
      bar,
      el('p', null, 'Matched ' + m.coreHit.length + ' of ' + m.coreTotal + ' core skills for ' + r.role.title + ' (' + m.suppHit.length + ' supporting skills).')
    ];
    if (m.coreMiss.length) nodes.push(el('div', 'sub', 'Missing core: ' + m.coreMiss.join(', ')));
    return card('📊', 'Resume–Job Match Score', nodes);
  }

  function recCard(r) {
    var nodes = [];
    if (!r.recommended.length) {
      nodes.push(el('p', null, 'You already cover the core and supporting skills for this role. Go deeper with advanced topics and real projects.'));
    } else {
      nodes.push(el('p', null, 'Highlighted skills are core requirements for ' + r.role.title + '.'));
      var wrap = el('div', 'chips');
      r.recommended.forEach(function (s) { wrap.appendChild(el('span', 'chip' + (s.core ? ' core' : ''), s.name)); });
      nodes.push(wrap);
    }
    return card('📈', 'Skill Recommendations', nodes);
  }

  function futureCard(r) {
    var nodes = [
      el('div', 'big', r.future.title),
      el('p', null, 'Next step ' + r.future.timeline + '.'),
      el('div', 'sub', 'Path: ' + r.future.path.join(' → '))
    ];
    return card('🚀', 'Predicted Future Role', nodes);
  }

  /* ---------- public ---------- */

  ui.renderResults = function (r) {
    var meta = r.meta.words + ' words · ' + r.skills.length + ' skills detected · ' + r.level.label;
    if (r.meta.years > 0) meta += ' · ~' + r.meta.years + ' yrs experience';
    $('resumeMeta').textContent = meta;

    animateATS(r.ats.score);
    $('atsText').textContent = r.ats.label + ' (' + r.ats.score + ' / 100)';
    renderBreakdown(r.ats.checks);

    var grid = $('resultsGrid');
    grid.textContent = '';
    grid.appendChild(skillsCard(r));
    grid.appendChild(roleCard(r));
    grid.appendChild(matchCard(r));
    grid.appendChild(card('💡', 'Actionable Feedback', [list(r.feedback, false)], 'wide'));
    grid.appendChild(recCard(r));
    grid.appendChild(card('❓', 'AI Interview Questions', [list(r.interview, true)], 'wide'));
    grid.appendChild(futureCard(r));
  };
})(typeof window !== 'undefined' ? window : globalThis);
