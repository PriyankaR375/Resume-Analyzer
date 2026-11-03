/* ==========================================================
   app.js — wiring: navigation, upload, theme, analyse flow.
   ========================================================== */
(function () {
  'use strict';
  var HB = window.HB;
  var ui = HB.ui;

  var homePage = document.getElementById('homePage');
  var resultsPage = document.getElementById('resultsPage');
  var resumeInput = document.getElementById('resumeInput');
  var uploadLabel = document.getElementById('uploadLabel');
  var analyzeBtn = document.getElementById('analyzeBtn');

  var UPLOAD_DEFAULT = '<span class="ico">⬆️</span> Upload resume';
  var uploadedFile = null;
  var busy = false;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- theme (remembered between visits) ---------- */
  try { if (localStorage.getItem('hb-theme') === 'dark') document.body.classList.add('dark'); } catch (e) {}
  document.getElementById('modeToggle').onclick = function () {
    var dark = document.body.classList.toggle('dark');
    try { localStorage.setItem('hb-theme', dark ? 'dark' : 'light'); } catch (e) {}
  };

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- navigation ---------- */
  function goTo(page) {
    homePage.classList.remove('active');
    resultsPage.classList.remove('active');
    page.classList.add('active');
    window.scrollTo(0, 0);
  }

  function resetUpload() {
    uploadedFile = null;
    resumeInput.value = ''; // lets the user pick the same file again
    uploadLabel.innerHTML = UPLOAD_DEFAULT;
  }

  document.getElementById('backHome').onclick = function () {
    goTo(homePage);
    resetUpload();
    ui.clearError();
    ui.hideProgress();
  };

  /* ---------- upload ---------- */
  resumeInput.onchange = function (e) {
    ui.clearError();
    uploadedFile = e.target.files[0] || null;
    if (uploadedFile) {
      uploadLabel.innerHTML = '<span class="ico">✔️</span> Resume uploaded';
      uploadLabel.title = uploadedFile.name;
    } else {
      uploadLabel.innerHTML = UPLOAD_DEFAULT;
    }
  };

  /* ---------- analyse ---------- */
  analyzeBtn.onclick = async function () {
    if (busy) return;
    ui.clearError();
    if (!uploadedFile) { ui.showError('Please upload a resume first.'); return; }

    busy = true;
    analyzeBtn.disabled = true;
    try {
      ui.showProgress(5, 'Extracting text…');
      var text = await HB.extractText(uploadedFile, function (msg, pct) { ui.showProgress(pct, msg); });

      ui.showProgress(55, 'Parsing skills and experience…');
      await sleep(300);
      var result = HB.analyzeResume(text);

      ui.showProgress(80, 'Computing insights…');
      await sleep(300);
      ui.showProgress(100, 'Preparing results…');
      await sleep(300);

      ui.renderResults(result);
      ui.hideProgress();
      goTo(resultsPage);
    } catch (err) {
      ui.hideProgress();
      ui.showError(err && err.message ? err.message : 'Something went wrong while analysing the resume.');
    } finally {
      busy = false;
      analyzeBtn.disabled = false;
    }
  };

  document.getElementById('premiumBtn').onclick = function () {
    ui.toast('Premium resume rewriting is coming soon.');
  };
})();
