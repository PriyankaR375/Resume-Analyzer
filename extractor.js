/* ==========================================================
   extractor.js — turns an uploaded file into plain text.

   PDF   -> pdf.js            (loaded on demand from a CDN)
   DOCX  -> mammoth.js        (loaded on demand from a CDN)
   Image -> Tesseract.js OCR  (loaded on demand from a CDN)
   TXT / RTF are read locally with no library.

   Usage: HB.extractText(file, onStatus(message, percent)) -> Promise<string>
   ========================================================== */
(function (root) {
  'use strict';
  var HB = root.HB = root.HB || {};

  var MAX_BYTES = 8 * 1024 * 1024;
  var MAX_PDF_PAGES = 8;
  var MIN_CHARS = 80;

  var CDN = {
    pdf: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    pdfWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    mammoth: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
    tesseract: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
  };

  var loading = {};
  function loadScript(url, label) {
    if (loading[url]) return loading[url];
    loading[url] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = function () {
        delete loading[url];
        reject(new Error('Could not load the ' + label + ' component. Please check your internet connection and try again.'));
      };
      document.head.appendChild(s);
    });
    return loading[url];
  }

  function ext(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  function readAsText(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result || '')); };
      r.onerror = function () { reject(new Error('The file could not be read.')); };
      r.readAsText(file);
    });
  }

  function readAsBuffer(file) {
    if (file.arrayBuffer) return file.arrayBuffer();
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('The file could not be read.')); };
      r.readAsArrayBuffer(file);
    });
  }

  function rtfToText(s) {
    return s
      .replace(/\\par[d]?/g, '\n')
      .replace(/\\'([0-9a-f]{2})/gi, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
      .replace(/\{\\\*[^{}]*\}/g, '')
      .replace(/\\[a-z]+-?\d* ?/gi, '')
      .replace(/[{}]/g, '');
  }

  async function pdfToText(file, onStatus) {
    await loadScript(CDN.pdf, 'PDF reader');
    var pdfjs = root.pdfjsLib;
    pdfjs.GlobalWorkerOptions.workerSrc = CDN.pdfWorker;
    var doc = await pdfjs.getDocument({ data: await readAsBuffer(file) }).promise;
    var pages = Math.min(doc.numPages, MAX_PDF_PAGES);
    var out = [];
    for (var i = 1; i <= pages; i++) {
      onStatus('Extracting text (page ' + i + ' of ' + pages + ')…', 5 + Math.round((i / pages) * 40));
      var page = await doc.getPage(i);
      var content = await page.getTextContent();
      var line = '', lastY = null, lastEnd = null;
      content.items.forEach(function (it) {
        if (!it.str && !it.hasEOL) return;
        var x = it.transform[4], y = it.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 3) { out.push(line); line = ''; lastEnd = null; }
        if (line && lastEnd !== null && x - lastEnd > 1 && !/\s$/.test(line) && !/^\s/.test(it.str)) line += ' ';
        line += it.str;
        lastY = y;
        lastEnd = x + (it.width || 0);
        if (it.hasEOL) { out.push(line); line = ''; lastY = null; lastEnd = null; }
      });
      if (line) out.push(line);
      out.push('');
    }
    return out.join('\n');
  }

  async function docxToText(file) {
    await loadScript(CDN.mammoth, 'Word reader');
    var res = await root.mammoth.extractRawText({ arrayBuffer: await readAsBuffer(file) });
    return res.value || '';
  }

  async function imageToText(file, onStatus) {
    onStatus('Loading text-recognition engine…', 8);
    await loadScript(CDN.tesseract, 'image text-recognition (OCR)');
    var result = await root.Tesseract.recognize(file, 'eng', {
      logger: function (m) {
        if (m.status === 'recognizing text') {
          onStatus('Reading text from image… ' + Math.round(m.progress * 100) + '%', 10 + Math.round(m.progress * 35));
        }
      }
    });
    return (result && result.data && result.data.text) || '';
  }

  HB.extractText = async function (file, onStatus) {
    onStatus = onStatus || function () {};
    if (!file) throw new Error('Please upload a resume first.');
    if (file.size === 0) throw new Error('This file is empty.');
    if (file.size > MAX_BYTES) throw new Error('This file is larger than 8 MB. Please upload a smaller resume.');

    var e = ext(file.name);
    var text = '';
    onStatus('Extracting text…', 5);

    if (e === 'txt') {
      text = await readAsText(file);
    } else if (e === 'rtf') {
      text = rtfToText(await readAsText(file));
    } else if (e === 'pdf') {
      text = await pdfToText(file, onStatus);
    } else if (e === 'docx') {
      text = await docxToText(file);
    } else if (e === 'doc') {
      throw new Error('Older .doc files cannot be read in the browser. Please save the resume as .docx or PDF and upload it again.');
    } else if (e === 'jpg' || e === 'jpeg' || e === 'png') {
      text = await imageToText(file, onStatus);
    } else {
      throw new Error('Unsupported file type ".' + (e || '?') + '". Please upload a PDF, DOCX, RTF, TXT, JPG or PNG file.');
    }

    if (!text || text.replace(/\s/g, '').length < MIN_CHARS) {
      throw new Error(
        e === 'pdf'
          ? 'Almost no text could be read from this PDF. It may be a scanned image — upload it as a JPG/PNG (we will read it with OCR) or export a text-based PDF.'
          : 'Not enough readable text was found in this file to analyse. Please check the file and try again.'
      );
    }
    return text;
  };
})(typeof window !== 'undefined' ? window : globalThis);
