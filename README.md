# Bachelorette / Hen Party Web Game Template

A customizable, mobile-optimized, real-time party game built specifically for a bachelorette or hen party. Players join on their phones, vote on questions about the bachelors, and wait for the host to reveal the results.

This repository is designed to be cloned and deployed for your own event!

## 🚀 Features
- **Real-Time Polling**: Players' screens update automatically when the host changes the game phase.
- **Micro-animations & Glassmorphism**: Premium UI feel tailored for mobile devices.
- **Session Persistence**: Uses a `deviceToken` so players can refresh their browser without losing their spot.
- **Admin Control Portal**: A `/admin` route for the host to control the game state and view progress.
- **Dynamic Registration**: Players select their name from a list pre-populated in the Google Sheet. If a player joins, their session is tied to their name and device token.


## 🛠 Technology Stack
This application consists of two decoupled components to maximize ease of deployment and avoid complex database setups for a one-off event.
- **Frontend**: Vanilla JavaScript and Vite. Hosted for free on GitHub Pages.
- **Backend / Database**: Google Apps Script acting as a REST API, using a Google Sheet as the persistent database to store player states and votes.

---

## ⚙️ How to Set Up Your Own Game

### 1. Backend (Google Apps Script)
1. Create a new Google Sheet.
2. Click **Extensions > Apps Script**.
3. Copy the entire contents of `backend/Code.js` from this repository and paste it into `Code.gs` in the generic editor.
4. **Secure the Admin PIN**: 
   - In the Apps Script editor, click the **Project Settings** (gear icon) on the left sidebar.
   - Scroll down to **Script Properties** and click **Add script property**.
   - Property: `HOST_CODE`
   - Value: `YOUR_SECRET_PIN` (e.g., `HEN2026`)
   - Click Save.
5. In the editor toolbar, select the `setup` function and click **Run**. This will create the necessary tabs in your Google Sheet. You will need to authorize the script.
6. **Populate Data**: Fill out the `Bachelors` and `Questions` tabs. For `Players`, you can pre-populate the `Name` column (Column A) with your guests. Note that the system is designed to match these names exactly. If a name is not on the list, the backend will still allow them to join and append them to the sheet, but the frontend currently restricts selection to the names it finds in the sheet.

7. **Deploy the API**: 
   - Click **Deploy > New deployment**.
   - Select type **Web app**.
   - Who has access: **Anyone**.
   - Click Deploy and **Copy the Web App URL**.

### 2. Frontend (GitHub Pages)
1. Fork or clone this repository.
2. **Local Development**: 
   - Create a file named `.env.local` inside the `frontend/` directory.
   - Add this line: `VITE_API_URL=YOUR_WEB_APP_URL_HERE`
   - Run `npm install` and `npm run dev` to test locally.
3. **Deploying to GitHub Pages**:
   - Go to your GitHub repository Settings > Pages > Source > **GitHub Actions**.
   - Go to Settings > Secrets and variables > Actions.
   - Click **New repository secret**.
   - Name: `VITE_API_URL`
   - Secret: *Paste your Google Apps Script Web App URL here*.
   - Click Add Secret.

Whenever you push to the `main` branch, the GitHub Action will automatically build and deploy your game!

## ⚠️ Limitations
- **Polling Architecture**: The frontend asks the backend for updates every 3 seconds. Google Apps Script has API quotas, so this architecture is designed for a single party (~10-20 players), not hundreds of concurrent users.
- **Security**: The "authentication" relies on a shared Admin PIN. It is not cryptographically secure and relies on the honor system among the party guests.
- **Player Management**: If a player's name was removed from the sheet but they had already joined, their local session will be reset when the frontend syncs next, forcing them to re-join from the updated list.

