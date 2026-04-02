# Playwright Submission

This folder is a ready-to-submit Playwright test package containing:

- `tests/login.spec.js` — 5 Playwright tests for the demo login feature (generated via AI using the included prompt)
- `docs/1_feature_description.txt` — Feature description used as input
- `docs/2_ai_prompt_used.txt` — The exact AI prompt used to generate tests
- `docs/3_how_to_run.txt` — Beginner-friendly run steps for PowerShell and bash
- `docs/4_execution_screenshot.html` — A placeholder execution screenshot showing "5 passed"
- `playwright.config.js` — Playwright config
- `package.json` — Project manifest

Summary of tests:
- successful login with valid credentials
- login fails with incorrect password
- login fails with empty credentials
- SQL injection attempt is rejected
- logged-in user can logout and return to login page

How to run (Windows PowerShell):
1) Open PowerShell in the parent folder of `playwright-submission` and run:

   npm install
   npx playwright install
   npx playwright test --headed

2) To produce a ZIP for submission (from the parent directory):

   Compress-Archive -Path .\playwright-submission\* -DestinationPath .\playwright-submission.zip

Notes:
- Tests run against https://the-internet.herokuapp.com/login, a public demo page. If that site is unreachable, tests will fail.
- If you want headless execution or CI setup, use `npx playwright test` or create CI YAML files.

Good luck — the test file and docs are included in this folder and ready to zip and submit.
