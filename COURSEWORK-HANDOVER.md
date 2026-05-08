# CPT304 Code Handover Notes

## Chosen project

Personal Budget App (`sptin2002/Budget-app`). This version is a Vite-based enhancement of the original small HTML/CSS/JavaScript app.

## Four reportable deficiencies fixed in code

### 1. XSS risk from unsafe HTML rendering

Original issue: user-controlled entry titles were rendered through HTML strings in the original prototype. This can allow injected markup or script-like payloads to be interpreted by the browser.

Implemented fix: entry rows are now created with `document.createElement()`, and user titles are inserted with `textContent` in `src/app.js`. This preserves the displayed title but prevents it from becoming executable HTML.

Good report evidence: show old `insertAdjacentHTML(...)` snippet versus new `title.textContent = entry.title` snippet.

### 2. Weak input validation

Original issue: the app accepted invalid values such as negative amounts, zero, non-numeric values, over-precise decimals and unrealistic large amounts.

Implemented fix: `src/validation.js` centralises validation. It checks non-empty title, 40-character title limit, finite numeric amount, amount > 0, maximum amount of 1,000,000 and maximum two decimals.

Good report evidence: before snippet with only empty-field checking versus new `validateEntryInput()` function.

### 3. Accessibility weaknesses in interactive controls

Original issue: clickable UI parts behaved visually like controls but lacked robust semantics for keyboard and assistive-technology users.

Implemented fix: the enhanced HTML uses real `<button>` controls, labels for inputs, ARIA tab roles, `aria-live` status feedback and visible `:focus-visible` styling.

Good report evidence: Lighthouse Accessibility 90+ screenshot and before/after HTML snippets for the add/tab controls.

### 4. Privacy/localStorage transparency weakness

Original issue: budget data could be stored locally without an explicit user-facing privacy explanation or consent flow.

Implemented fix: `src/storage.js` gates entry persistence behind consent. The UI includes a cookie/localStorage banner, accept/decline actions, a privacy policy dialog and a clear-data button.

Good report evidence: screenshot of the consent banner and privacy policy dialog; code snippet showing `hasStorageConsent()` before `saveEntries()`.

## Baseline standards status

| Standard | Code status | What the group still needs to capture |
|---|---|---|
| 7+ day uptime | Vite build is ready for Vercel | Vercel deployment history screenshot after 7 days |
| 80%+ coverage | `npm run coverage` verified locally above 80% | Codecov badge/screenshot after GitHub setup |
| Lighthouse Accessibility 90+ | Semantic HTML and ARIA implemented | Chrome/Edge Lighthouse Accessibility screenshot |
| i18n | English/Chinese toggle implemented | Screenshot of both languages |
| Legal compliance | Consent banner + Privacy Policy dialog implemented | Screenshot of banner/dialog |

## Commands

```bash
npm install
npm run start
npm test
npm run coverage
npm run build
```

## Important handover note

The report should not describe the baseline standards as the four deficiencies. The deficiencies are the specific weaknesses found in the original code. The baseline standards are separate required evidence items.
