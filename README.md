# Budget App - CPT304 Enhanced Version

[![codecov](https://codecov.io/gh/ljw12383838/budget-app-cpt304-group8/branch/main/graph/badge.svg)](https://codecov.io/gh/ljw12383838/budget-app-cpt304-group8)

This is an enhanced version of the Personal Budget App for CPT304 Coursework 1: Research-Led Software Enhancement.

## Main Improvements

- Security: replaced unsafe HTML string rendering with DOM APIs and `textContent` to reduce XSS risk.
- Logic quality: added strict validation for title length, positive numeric amounts, maximum amount and two-decimal precision.
- Accessibility: rebuilt interactive controls with semantic buttons, form labels, ARIA tabs, status messages and visible keyboard focus.
- Internationalisation: added a working English/Chinese language toggle.
- Legal/privacy: added localStorage consent banner, privacy policy dialog and clear-data control.
- Testing: added Vitest coverage for the core maintainable modules: model, validation, storage, i18n and chart rendering.

## Run Locally

```bash
npm install
npm run start
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Test and Coverage

```bash
npm test
npm run coverage
```

Current verified local result:

```text
Test Files   1 passed
Tests        18 passed

All files:
Statements   100%
Branches     95.58%
Functions    100%
Lines        100%
```

This exceeds the required 80% test coverage baseline.

The coverage report is generated in:

```text
coverage/lcov.info
```

This file can be uploaded to Codecov through the GitHub Actions workflow. The coverage configuration focuses on the core modules that are appropriate for unit testing. Browser-level behaviour in `app.js` is evidenced through manual functional testing and Lighthouse screenshots.

## Build

```bash
npm run build
```

## Deployment

Deploy the repository to Vercel as a static Vite project:

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
Install command: npm install
```

Keep the deployment live for 7 consecutive days and screenshot the deployment history for the report.

## Evidence Needed for Report Section 6

The following screenshots or badges should be collected for the report:

1. Vercel/Render 7-day live deployment log.
2. Codecov badge or Istanbul/Vitest coverage result showing 80%+ coverage.
3. Lighthouse Accessibility screenshot showing 90+.
4. Screenshot of the English/Chinese language toggle.
5. Screenshot of the cookie/localStorage consent banner.
6. Screenshot of the Privacy Policy dialog.

## Suggested Deficiencies for the Report

The report can use the following four source-code deficiencies:

1. **XSS vulnerability from unsafe user-input rendering**  
   The original app rendered user-controlled content using HTML string insertion. The enhanced version renders entries using DOM APIs and `textContent`.

2. **Weak input validation**  
   The original app only checked whether fields were empty. The enhanced version validates title length, numeric format, positive amount, maximum amount and two-decimal precision.

3. **Accessibility weakness**  
   The original app used non-semantic clickable elements and lacked sufficient assistive labels. The enhanced version uses semantic buttons, labels, ARIA tab attributes, `aria-live` feedback and visible keyboard focus.

4. **Privacy/localStorage transparency weakness**  
   The original app stored budget data without clear consent or privacy explanation. The enhanced version adds a consent banner, Privacy Policy dialog, consent-gated localStorage persistence and a clear-data control.

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── font/
├── src/
│   ├── app.js
│   ├── chart.js
│   ├── i18n.js
│   ├── model.js
│   ├── storage.js
│   └── validation.js
├── tests/
│   └── core.test.js
├── .gitignore
├── COURSEWORK-HANDOVER.md
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── style.css
└── vite.config.js
```

## Notes for Coursework Handover

- Do not upload `node_modules`, `coverage`, or `dist` to GitHub.
- Keep screenshots with clear file names, for example:
    - `01-coverage-80plus.png`
    - `02-lighthouse-accessibility-100.png`
    - `03-cookie-consent-banner.png`
    - `04-privacy-policy-dialog.png`
    - `05-i18n-toggle.png`
    - `06-vercel-deployment.png`
- The final ZIP submission should include `report.pdf`, `github-url.txt`, `live-url.txt`, and `individual-contribution.xlsx` according to the coursework brief.