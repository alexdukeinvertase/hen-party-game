# Rose Gold Hen Party Game

A mobile-optimized, real-time party game built specifically for a bachelorette/hen party. Players join on their phones, vote on questions about the bachelors, and wait for the host to reveal the results.

## 🔗 Live Links
- **Google Sheet (Database)**: [View Spreadsheet](https://docs.google.com/spreadsheets/d/12vAFai2szkg9C92Qt2XVa_UjG7rGcuo-L0DEjEmIsrs/edit)
- **Google Apps Script (Backend Code)**: [View Apps Script Editor](https://script.google.com/home/projects/199lWAJBCvPgTnKex_KYJbVFa7lxDGu-bVkFrS5MkvGSkCNNv7qlNc_fL/edit)
- **Web App API Endpoint**: `https://script.google.com/macros/s/AKfycbxLb0dF_CSTtDwFRV4RW90Yht--MSeeJX6xLeqHmTtI2rrF8lQUNseVi7Fcsb7G246lFg/exec`

## 🛠 Technology Stack
This application consists of two decoupled components to maximize ease of deployment and avoid complex database setups for a one-off event.
- **Frontend**: Vanilla JavaScript, Vite, HTML/CSS. Uses front-end polling to fetch the current game state from the backend.
- **Backend / Database**: Google Apps Script acting as a REST API, using Google Sheets as the persistent database to store player states and votes.

## 📱 How It Works for Users
1. **Joining**: Players navigate to the web app URL on their mobile devices. They select their name from a pre-defined dropdown. The browser saves a unique `deviceToken` to ensure they stay logged in if they accidentally refresh the page.
2. **Waiting**: If the host hasn't started the game yet, players sit on a waiting screen.
3. **Voting**: Once the host changes the state to `VOTING`, players are presented with a grid of bachelors. They tap to select their answers for 10 sequential questions. Answers are saved immediately to the Google Sheet.
4. **Results**: After voting is complete, they return to the waiting screen until the host changes the state to `RESULTS`.

## 👑 Admin Portal
The host can control the flow of the game by navigating to the `/admin` route (e.g., `http://localhost:5173/admin`).
- **PIN**: `HEN2026`
- **Controls**: Change the game phase globally (`JOINING` -> `VOTING` -> `RESULTS`).
- **Dashboard**: View in real-time who has joined and who has finished answering all questions.
- **Reset**: If a player loses their session or joins on the wrong device, the host can "Reset" their name to allow them to rejoin.

## 🔧 How to Update or Modify

### Updating the Frontend
1. Open the project and make changes in the `frontend/` directory.
2. Run `npm run dev` to test your visual changes locally.
3. **To Deploy**: Run `npm run build`. This generates a `dist/` folder containing the static HTML/CSS/JS. You can upload this folder to any static web host (like GitHub Pages, Netlify, or Vercel) and send that link to your guests.

### Updating the Backend
1. Modify `backend/Code.js` either locally or directly in the Google Apps Script editor.
2. If working locally, push your changes to Google using `clasp`:
   ```bash
   cd backend
   clasp push
   ```
3. **CRITICAL**: If you change the backend logic, you *must* create a new deployment for the changes to take effect publicly. In the Apps Script editor, click **Deploy > New deployment**. Select **Web app**, ensure access is set to **"Anyone"**, click deploy, and optionally update the `API_URL` in `frontend/src/api.js` if Google generates a new URL.

## ⚠️ Limitations
- **Polling Architecture**: The frontend asks the backend for updates every 3 seconds. Because Google Apps Script has API quotas, having ~15 players polling simultaneously is perfectly fine for a hen party, but this architecture is not built to scale to hundreds of concurrent users.
- **Hardcoded Setup**: Questions, Bachelor lists, and eligible Players are initialized via the `setup()` function in the Apps Script and written directly into the Google Sheet. Adding new players or questions requires modifying the Google Sheet directly.
- **Security**: The "authentication" is purely based on UI tokens and a shared Admin PIN. It is not cryptographically secure and relies entirely on the honor system among the party guests.
