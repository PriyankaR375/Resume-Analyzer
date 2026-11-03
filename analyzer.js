/* ==========================================================
   analyzer.js — the analysis engine (no UI code in here).

   HB.analyzeResume(text) reads the REAL resume text and returns:
     skills, level, role prediction, Resume–Job Match Score,
     ATS score with a per-check breakdown, feedback, skill gaps,
     interview questions and a career path.

   Everything is rule-based and deterministic: the same resume
   always gives the same result, and different resumes give
   different results because they are scored on their content.
   ========================================================== */
(function (root) {
  'use strict';
  var HB = root.HB = root.HB || {};

  var MONTH_RE = 'jan|feb|mar|apr|may|jun|jul|aug|sept|sep|oct|nov|dec';
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  var ACTION_VERBS = ['developed', 'built', 'designed', 'implemented', 'created', 'led', 'managed', 'optimized', 'optimised',
    'improved', 'reduced', 'increased', 'automated', 'deployed', 'launched', 'architected', 'engineered', 'analyzed', 'analysed',
    'delivered', 'collaborated', 'integrated', 'migrated', 'maintained', 'mentored', 'spearheaded', 'streamlined', 'resolved',
    'tested', 'configured', 'trained', 'researched', 'achieved', 'coordinated', 'established', 'generated', 'enhanced',
    'refactored', 'documented', 'presented', 'organized', 'organised', 'executed', 'drove', 'supervised', 'initiated',
    'modernized', 'scaled', 'secured', 'monitored', 'debugged', 'wrote', 'participated', 'contributed', 'handled', 'conducted',
    'evaluated', 'proposed', 'applied', 'planned', 'redesigned', 'processed', 'visualized', 'predicted', 'fine-tuned'];

  var SECTION_PATTERNS = {
    summary: /^(professional\s+|career\s+)?(summary|profile|objective)$|^about(\s+me)?$/,
    skills: /^(technical\s+|key\s+|core\s+)?(skills?|technologies|tech\s+stack|competencies)(\s*(&|and)\s*tools)?$|^skills\s*(&|and)\s*\w+$/,
    experience: /^(work\s+|professional\s+|relevant\s+|internship\s+)?(experience|employment(\s+history)?|work\s+history)$|^internships?$/,
    education: /^(education(al)?(\s+background|\s+qualifications?)?|academics?|academic\s+qualifications?|qualifications?)$/,
    projects: /^(academic\s+|personal\s+|key\s+|major\s+)?projects?$/,
    certifications: /^(certifications?|certificates?|courses|licenses?)(\s*(&|and)\s*\w+)?$/,
    achievements: /^(achievements?|awards?|honou?rs|accomplishments?)(\s*(&|and)\s*\w+)?$/
  };

  var SECTION_FALLBACK = {
    education: /\b(b\.?\s?tech|b\.?\s?e\.?|bachelor|master|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|mba|bca|mca|university|college|institute|diploma|cgpa|gpa)\b/i,
    skills: /\b(technical skills|skills)\b/i,
    projects: /\bprojects?\b/i,
    experience: /\b(work experience|professional experience|internship|employment)\b/i
  };

  /* ---------- helpers ---------- */

  function normalize(raw) {
    return String(raw)
      .replace(/\r/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/[●▪■◦‣∙·]/g, '•')
      .replace(/[ ]{2,}/g, ' ');
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function termPattern(term) {
    return escapeRe(term.toLowerCase()).replace(/ +/g, '[\\s\\-]+');
  }

  // Pre-compile one regex per skill (leading group instead of look-behind => works in every browser)
  var COMPILED = HB.SKILLS.map(function (skill) {
    var terms = (skill.exact ? [] : [skill.name]).concat(skill.aliases);
    if (!terms.length) return { skill: skill, re: null };
    var src = '(^|[^A-Za-z0-9+#])(' + terms.map(termPattern).join('|') + ')(?![A-Za-z0-9+#])';
    return { skill: skill, re: new RegExp(src, 'gi') };
  });

  function countMatches(re, text) {
    re.lastIndex = 0;
    var n = 0;
    while (re.exec(text) && n < 50) n++;
    return n;
  }

  function splitSections(lines) {
    var sections = {};
    var current = null;
    lines.forEach(function (line) {
      var probe = line.replace(/^[•\-*\s]+/, '').replace(/[:\-–—_|\s]+$/, '').toLowerCase();
      var matched = null;
      if (probe.length > 0 && probe.length <= 40) {
        Object.keys(SECTION_PATTERNS).some(function (key) {
          if (SECTION_PATTERNS[key].test(probe)) { matched = key; return true; }
          return false;
        });
      }
      if (matched) {
        current = matched;
        if (!sections[current]) sections[current] = [];
      } else if (current) {
        sections[current].push(line);
      }
    });
    return sections;
  }

  function extractSkills(text, skillsSectionText) {
    var found = [];
    var tokens = skillsSectionText.split(/[,;|•\n\/()]+/).map(function (t) { return t.trim(); });
    COMPILED.forEach(function (c) {
      var count = c.re ? countMatches(c.re, text) : 0;
      if (c.skill.exact && tokens.indexOf(c.skill.name) !== -1) count = Math.max(count, 1);
      if (count > 0) found.push({ name: c.skill.name, category: c.skill.category, count: count });
    });
    found.sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
    return found;
  }

  function estimateYears(expText, fullText) {
    var now = new Date();
    var nowIdx = now.getFullYear() * 12 + now.getMonth();
    var ranges = [];
    var re = new RegExp('(?:(' + MONTH_RE + ')[a-z]*\\.?\\s*,?\\s*)?((?:19|20)\\d{2})\\s*(?:-|–|—|to)\\s*(?:(present|current|now|till date|ongoing)|(?:(' + MONTH_RE + ')[a-z]*\\.?\\s*,?\\s*)?((?:19|20)\\d{2}))', 'gi');
    var m;
    while ((m = re.exec(expText)) !== null) {
      var sm = m[1] ? MONTHS.indexOf(m[1].toLowerCase().slice(0, 3)) : 0;
      var start = parseInt(m[2], 10) * 12 + sm;
      var end;
      if (m[3]) end = nowIdx;
      else {
        var em = m[4] ? MONTHS.indexOf(m[4].toLowerCase().slice(0, 3)) : 11;
        end = parseInt(m[5], 10) * 12 + em;
      }
      if (end >= start && end <= nowIdx + 1) ranges.push([start, end + 1]);
    }
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var months = 0, curS = null, curE = null;
    ranges.forEach(function (r) {
      if (curS === null) { curS = r[0]; curE = r[1]; }
      else if (r[0] <= curE) curE = Math.max(curE, r[1]);
      else { months += curE - curS; curS = r[0]; curE = r[1]; }
    });
    if (curS !== null) months += curE - curS;
    var fromRanges = months / 12;

    var explicit = 0;
    var ex = /(\d{1,2}(?:\.\d)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:professional\s+|relevant\s+|work\s+|industry\s+|hands-on\s+)?experience/gi;
    while ((m = ex.exec(fullText)) !== null) explicit = Math.max(explicit, parseFloat(m[1]));

    var years = Math.max(fromRanges, explicit);
    return Math.min(Math.round(years * 10) / 10, 40);
  }

  function levelFromYears(y) {
    if (y < 1) return 'fresher';
    if (y < 3) return 'junior';
    if (y < 6) return 'mid';
    return 'senior';
  }

  function countMetrics(text) {
    var re = /\b\d+(?:\.\d+)?\s?(?:%|x\b|k\b|\+)|[$₹€£]\s?\d[\d,.]*|\b\d[\d,]*\s?(?:users|customers|requests|records|clients|projects|models|apis?|services|members|students|ms|seconds|hours|lpa|crore|lakh|datasets|images|endpoints|stores)\b/gi;
    return (text.match(re) || []).length;
  }

  function status(score, max) {
    var r = score / max;
    return r >= 0.85 ? 'pass' : r >= 0.4 ? 'warn' : 'fail';
  }

  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  /* ---------- ATS ---------- */

  function buildAts(ctx) {
    var checks = [];
    function add(id, label, max, score, tip) {
      score = Math.max(0, Math.min(max, Math.round(score)));
      checks.push({ id: id, label: label, max: max, score: score, status: status(score, max), tip: tip });
    }

    add('email', 'Email address', 6, ctx.email ? 6 : 0, 'Add a professional email address in the header.');
    add('phone', 'Phone number', 5, ctx.phone ? 5 : 0, 'Add a phone number so recruiters can reach you.');
    add('links', 'LinkedIn / GitHub link', 4, (ctx.linkedin || ctx.github) ? 4 : ctx.url ? 2 : 0, 'Add your LinkedIn and/or GitHub profile link.');

    add('skillsSec', 'Skills section', 8, ctx.has.skills ? 8 : (ctx.skillCount >= 5 ? 4 : 0), 'Add a clearly labelled "Skills" section listing your tools and technologies.');
    add('educationSec', 'Education section', 6, ctx.has.education ? 6 : 0, 'Add an "Education" section with degree, institute and year.');
    add('experienceSec', 'Experience / internships', 8, ctx.has.experience ? 8 : (ctx.has.projects ? 4 : 0), 'Add an "Experience" (or Internships) section with role, company and dates.');
    add('projectsSec', 'Projects section', 3, ctx.has.projects ? 3 : 0, 'Add a "Projects" section with 2–3 projects and the tech stack used.');
    add('summarySec', 'Summary / objective', 3, ctx.has.summary ? 3 : 0, 'Add a 2–3 line professional summary at the top, tailored to your target role.');

    var w = ctx.words, lenScore, lenTip;
    if (w >= 350 && w <= 900) lenScore = 10;
    else if (w >= 200 && w < 350) lenScore = 6;
    else if (w > 900 && w <= 1200) lenScore = 7;
    else if (w > 1200) lenScore = 4;
    else lenScore = 2;
    lenTip = w < 350
      ? 'Your resume is short (' + w + ' words). Expand project and experience details toward 350–900 words (about 1–2 pages).'
      : 'Your resume is long (' + w + ' words). Trim it to 1–2 pages and keep the most relevant work.';
    add('length', 'Resume length (' + w + ' words)', 10, lenScore, lenTip);

    add('keywords', 'Relevant skill keywords (' + ctx.skillCount + ' found)', 20, Math.min(ctx.skillCount / 12, 1) * 20,
      (ctx.skillCount === 0 ? 'No recognisable skills were found.' : 'Only ' + ctx.skillCount + ' recognised skill' + (ctx.skillCount === 1 ? ' was' : 's were') + ' found.') +
      ' List more relevant tools and technologies and mirror keywords from the job descriptions you target.');
    add('verbs', 'Action verbs (' + ctx.verbCount + ' distinct)', 10, Math.min(ctx.verbCount / 8, 1) * 10,
      'Start bullet points with strong action verbs such as Developed, Built, Optimized or Led.');
    add('metrics', 'Quantified results (' + ctx.metrics + ' found)', 10, Math.min(ctx.metrics / 4, 1) * 10,
      'Quantify your impact with numbers, e.g. "reduced load time by 35%" or "served 10k users".');
    add('bullets', 'Bullet-point formatting', 7, Math.min(ctx.bullets / 6, 1) * 7,
      'Use bullet points for responsibilities and achievements so the resume is easy to scan.');

    var total = checks.reduce(function (s, c) { return s + c.score; }, 0);
    var label = total >= 85 ? 'Excellent' : total >= 70 ? 'Good' : total >= 50 ? 'Needs Improvement' : 'Needs Major Improvement';
    return { score: total, label: label, checks: checks };
  }

  /* ---------- role prediction ---------- */

  function scoreRole(role, foundSet, lowerText) {
    var coreHit = role.core.filter(function (n) { return foundSet[n]; });
    var suppHit = role.support.filter(function (n) { return foundSet[n]; });
    var coreCov = coreHit.length / role.core.length;
    var suppCov = Math.min(1, suppHit.length / role.supportTarget);
    var sig = role.signature.filter(function (n) { return foundSet[n]; }).length;
    var kw = role.keywords.filter(function (k) { return lowerText.indexOf(k) !== -1; }).length;

    var score = 0.65 * coreCov + 0.35 * suppCov;
    if (kw) score = Math.min(1, score + 0.08 * Math.min(kw, 2));
    if (sig === 0 && !kw) score *= 0.4;

    return {
      role: role,
      score: score,
      coreHit: coreHit,
      suppHit: suppHit,
      coreMiss: role.core.filter(function (n) { return !foundSet[n]; }),
      suppMiss: role.support.filter(function (n) { return !foundSet[n]; })
    };
  }

  function interviewQuestions(best, skills, foundSet) {
    var role = best.role;
    var relevant = {};
    role.core.concat(role.support).forEach(function (n) { relevant[n] = true; });
    var tech = skills.filter(function (s) { return s.category !== 'Soft Skills' && s.category !== 'Tools & Practices'; });
    var picks = tech.filter(function (s) { return relevant[s.name]; }).concat(tech.filter(function (s) { return !relevant[s.name]; }));
    var skillQs = picks.slice(0, 2).map(function (s) {
      return 'Your resume lists ' + s.name + '. Describe a concrete problem you solved with it and the trade-offs you considered.';
    });
    var roleQs = role.questions.slice(0, skillQs.length >= 2 ? 3 : 5 - skillQs.length);
    return roleQs.concat(skillQs);
  }

  /* ---------- main ---------- */

  HB.analyzeResume = function (raw) {
    var text = normalize(raw);
    var lines = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var lower = text.toLowerCase();
    var sections = splitSections(lines);

    var has = {};
    Object.keys(SECTION_PATTERNS).forEach(function (k) {
      has[k] = !!sections[k] || (SECTION_FALLBACK[k] ? SECTION_FALLBACK[k].test(text) : false);
    });

    var skills = extractSkills(text, (sections.skills || []).join('\n'));
    var foundSet = {};
    skills.forEach(function (s) { foundSet[s.name] = true; });

    var years = estimateYears((sections.experience || []).join('\n'), text);
    var levelKey = levelFromYears(years);
    var level = HB.LEVELS[levelKey];

    // contact & structure signals
    var email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
    var phone = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text) || /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/.test(text);
    var linkedin = /linkedin\.com\/(in|pub)\/[\w-]+/i.test(text);
    var github = /github\.com\/[\w-]+/i.test(text);
    var url = /https?:\/\/\S+|www\.\S+/i.test(text);

    var verbCount = ACTION_VERBS.filter(function (v) {
      return new RegExp('\\b' + v.replace('-', '[\\s-]?') + '\\b', 'i').test(lower);
    }).length;
    var verbSet = {};
    ACTION_VERBS.forEach(function (v) { verbSet[v] = true; });
    var bullets = lines.filter(function (l) {
      if (/^(•|-|\*|–|▪|\d+[.)])\s*\S/.test(l)) return true;
      var first = l.split(/\s+/)[0].toLowerCase().replace(/[^a-z-]/g, '');
      return l.split(/\s+/).length >= 6 && verbSet[first];
    }).length;

    var words = (text.match(/\S+/g) || []).length;
    var metrics = countMetrics(text);

    var ats = buildAts({
      email: email, phone: phone, linkedin: linkedin, github: github, url: url,
      has: has, skillCount: skills.length, words: words,
      verbCount: verbCount, metrics: metrics, bullets: bullets
    });

    // role prediction
    var ranked = HB.ROLES.map(function (r) { return scoreRole(r, foundSet, lower); })
      .sort(function (a, b) { return b.score - a.score; });
    var best = ranked[0];
    var lowConfidence = skills.length < 3 || best.score < 0.15;
    if (best.score < 0.05) {
      // nothing recognisable: fall back to general software fundamentals as the starting point
      best = ranked.filter(function (r) { return r.role.id === 'software-engineer'; })[0];
    }

    var matchScore = Math.round(best.score * 100);
    var ladderIdx = level.ladderIndex;
    var role = best.role;
    var current = role.ladder[ladderIdx];
    var futureIdx = Math.min(ladderIdx + (levelKey === 'junior' ? 1 : 1), role.ladder.length - 1);
    if (levelKey === 'fresher' || levelKey === 'junior') futureIdx = 1;

    // skill recommendations: missing core first, then missing supporting skills
    var recommended = best.coreMiss.map(function (n) { return { name: n, core: true }; })
      .concat(best.suppMiss.map(function (n) { return { name: n, core: false }; }))
      .slice(0, 8);

    // feedback: role gap first, then the biggest ATS gaps
    var feedback = [];
    if (best.coreMiss.length) {
      feedback.push('To fit ' + role.title + ' roles better, show hands-on evidence of ' + best.coreMiss.slice(0, 3).join(', ') + ' in your projects or experience.');
    }
    ats.checks
      .filter(function (c) { return c.status !== 'pass'; })
      .sort(function (a, b) { return (b.max - b.score) - (a.max - a.score); })
      .slice(0, 4)
      .forEach(function (c) { feedback.push(c.tip); });
    if (!feedback.length) feedback.push('Strong structure. Tailor the keywords in your summary and skills to each job description you apply to.');
    feedback = feedback.slice(0, 5);

    return {
      meta: { words: words, years: years, metrics: metrics, bullets: bullets, verbs: verbCount },
      skills: skills,
      level: { key: levelKey, label: level.label },
      lowConfidence: lowConfidence,
      role: {
        title: role.title,
        currentTitle: current,
        confidence: matchScore,
        alternatives: ranked.slice(1, 3).filter(function (r) { return r.score > 0.15; })
          .map(function (r) { return { title: r.role.title, score: Math.round(r.score * 100) }; })
      },
      match: {
        score: matchScore,
        coreHit: best.coreHit,
        coreTotal: best.role.core.length,
        coreMiss: best.coreMiss,
        suppHit: best.suppHit
      },
      ats: ats,
      feedback: feedback,
      recommended: recommended,
      interview: interviewQuestions(best, skills, foundSet),
      future: {
        title: role.ladder[futureIdx],
        timeline: level.nextTimeline,
        path: role.ladder.slice(Math.min(ladderIdx, futureIdx), futureIdx + 2)
      }
    };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = HB;
})(typeof window !== 'undefined' ? window : globalThis);
