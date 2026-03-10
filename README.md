# 💍 Hen Party Game

A mobile-first bachelorette party voting game.

## How it works

Players answer **10 questions** by tapping one of **12 men** shown as image cards.

At the end:
- 🏆 The man with the **fewest** votes is the **winner**
- 💀 The man with the **most** votes is the **loser**

> Players do not win or lose — they are only voting on the 12 men.

---

## Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Frontend     | HTML, CSS, JavaScript         |
| Hosting      | GitHub Pages                  |
| Data storage | Google Sheets                 |
| API          | Google Apps Script            |

---

## Project structure

```
hen-party-game/
├── index.html          ← Single-page app (welcome → questions → results)
├── style.css           ← Mobile-first styles
├── script.js           ← Game logic + Google Sheets submission
└── apps-script/
    └── Code.gs         ← Google Apps Script backend (POST → Sheets)
```

---

## Quick start (play locally)

```bash
# No build step required — just open index.html in a browser
open index.html
```

Or serve it with any static file server:

```bash
npx serve .
# Then visit http://localhost:3000
```

---

## Adding real photos

1. Open `script.js`.
2. Find the `MEN` array near the top.
3. Set the `image` property for each man to a URL (absolute or relative):

```js
{ id: 1, name: 'Alex', emoji: '🧑', image: 'images/alex.jpg' },
```

Put the photos in an `images/` folder at the root of the project.
If `image` is an empty string the game falls back to the emoji avatar.

---

## Google Sheets integration

### 1 — Create the spreadsheet

Create a new Google Sheet. Copy the long ID from its URL:

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

### 2 — Deploy the Apps Script

1. Open the sheet → **Extensions → Apps Script**.
2. Replace all default code with the contents of `apps-script/Code.gs`.
3. Update `SPREADSHEET_ID` at the top of the script.
4. Click **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
5. Authorise the script when prompted.
6. Copy the deployment URL (looks like `https://script.google.com/macros/s/…/exec`).

### 3 — Connect the game

Open `script.js` and paste the URL:

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

Results are now saved to two sheets automatically:

| Sheet      | Contents                                      |
|------------|-----------------------------------------------|
| `Sessions` | One row per game — winner, loser, vote counts |
| `Votes`    | One row per vote — question & man chosen      |

---

## Deploy to GitHub Pages

1. Push to the `main` branch (or the branch you configure).
2. Go to **Settings → Pages** in your repository.
3. Set *Source* to **Deploy from a branch** → `main` → `/ (root)`.
4. Your game will be live at `https://<username>.github.io/<repo>/`.

---

## Customising questions

Edit the `QUESTIONS` array in `script.js`:

```js
const QUESTIONS = [
  'Who would make the best wedding date?',
  // … add or change any of the 10 questions
];
```
