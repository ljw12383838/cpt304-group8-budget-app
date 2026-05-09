# Budget App - CPT304 Group 8

[![codecov](https://codecov.io/gh/ljw12383838/cpt304-group8-budget-app/branch/main/graph/badge.svg)](https://codecov.io/gh/ljw12383838/cpt304-group8-budget-app)

An enhanced Personal Budget App developed for CPT304 Coursework 1: Research-Led Software Enhancement.

The application improves the original prototype with safer rendering, stronger validation, better accessibility, bilingual interface support, privacy-aware local storage, automated testing, and deployment-ready configuration.

## Features

- Add and remove income and expense entries.
- Automatically calculate total income, total expenses, and balance.
- Display a visual income/expense summary chart.
- Validate user input before creating budget entries.
- Support English and Chinese interface switching.
- Store budget entries locally only after user consent.
- Provide a Privacy Policy dialog and a clear-data option.
- Support keyboard navigation and accessible interface controls.

## Main Enhancements

### Security

User-entered budget entry titles are rendered with DOM APIs and `textContent` rather than unsafe HTML string insertion. This reduces the risk of script injection through form input.

### Validation

Input validation is centralised in `src/validation.js`. The enhanced validation checks:

- Empty titles
- Overlong titles
- Invalid numeric input
- Zero or negative amounts
- Excessively large amounts
- Amounts with more than two decimal places

### Accessibility

The interface uses semantic HTML, labelled form controls, ARIA attributes, live status feedback, and visible keyboard focus styles. These changes improve usability for keyboard and assistive technology users.

### Internationalisation

The app supports an English/Chinese language toggle. Interface text, placeholders, document title, and language metadata update when the language is changed.

### Privacy

Budget data is stored in browser `localStorage` only after user consent. Users can accept or decline local persistence, open the Privacy Policy dialog, and clear locally stored budget data.

### Testing and CI

The project uses Vitest with V8 coverage reporting. GitHub Actions runs the test and coverage workflow automatically.

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── font/
├── icon/
├── src/
│   ├── app.js
│   ├── chart.js
│   ├── i18n.js
│   ├── model.js
│   ├── storage.js
│   └── validation.js
├── tests/
│   └── core.test.js
├── index.html
├── style.css
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run start
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Testing

Run the automated test suite:

```bash
npm test
```

Run the coverage report:

```bash
npm run coverage
```

Current verified coverage result:

```text
Test Files   1 passed
Tests        18 passed

All files:
Statements   100%
Branches     95.58%
Functions    100%
Lines        100%
```

The coverage report is generated in:

```text
coverage/lcov.info
```

## Build

Create the production build:

```bash
npm run build
```

The production output is generated in:

```text
dist/
```

## Deployment

This project can be deployed as a Vite static application.

Recommended Vercel settings:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

## Quality Assurance

The enhanced application was verified using:

- Automated unit tests with Vitest
- V8 coverage reporting
- Codecov coverage badge
- Browser-based functional testing
- Lighthouse accessibility auditing
- Manual checks for language switching, localStorage consent, and privacy controls

## Repository Notes

Generated files and local environment files are excluded from version control through `.gitignore`, including:

```text
node_modules/
dist/
coverage/
.idea/
.env
```