# HireBoost AI — Smart AI-Powered Resume Analyzer & Skill Recommendation System

A client-side web app: upload a resume and get skills, predicted role, Resume–Job Match Score,
ATS score, feedback, skill gaps, interview questions and a career path.

## Run
Open `index.html` in a browser (Chrome/Edge/Firefox). No build step or server needed.
For PDF, DOCX and image (OCR) support the browser needs internet access, because
pdf.js, mammoth.js and Tesseract.js are loaded on demand from a CDN. TXT and RTF work offline.

## Structure
```
index.html          landing page + results page markup
css/styles.css      all styles (landing rules unchanged; additions marked)
js/skills.js        skill dictionary (names, aliases, categories)
js/roles.js         11 role profiles: core/supporting skills, interview questions, career ladder
js/extractor.js     file -> text (PDF, DOCX, RTF, TXT, JPG/PNG via OCR)
js/analyzer.js      analysis engine (no DOM code)
js/ui.js            rendering: progress, errors, ATS ring, result cards
js/app.js           wiring: navigation, upload, theme, analyse flow
```

## How the analysis works
- **Skills**: regex match of every skill/alias against the resume text (word-boundary safe, so "Java" ≠ "JavaScript").
- **Role + Match Score**: 65% core-skill coverage + 35% supporting-skill coverage per role, boosted by job-title words,
  penalised if none of the role's signature skills appear. Highest score = predicted role.
- **ATS score (100 pts)**: contact info 15, sections 28, length 10, skill keywords 20, action verbs 10,
  quantified results 10, bullet formatting 7. Every check is shown on the results page.
- **Level / future role**: experience years from dates in the Experience section (or "N years of experience"),
  mapped to Fresher / Junior / Mid / Senior and the role's career ladder.

## Extending
- Add skills in `js/skills.js`; add roles in `js/roles.js` (skill names must match the dictionary).
- The rule-based engine in `js/analyzer.js` can be swapped for an LLM/API call without touching the UI.
