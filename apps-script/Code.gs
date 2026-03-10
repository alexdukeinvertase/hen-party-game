/**
 * Hen Party Game — Google Apps Script backend
 * =============================================
 * This script receives POST requests from the game and writes each
 * session's results to a Google Sheet.
 *
 * HOW TO DEPLOY
 * -------------
 * 1. Open Google Sheets and create a new spreadsheet.
 * 2. Click Extensions → Apps Script.
 * 3. Replace the default code with this file.
 * 4. Update SPREADSHEET_ID below (copy from your sheet's URL).
 * 5. Click Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Authorise the script and copy the deployment URL.
 * 7. Paste the URL into the APPS_SCRIPT_URL constant in script.js.
 *
 * SHEET STRUCTURE
 * ---------------
 * The script auto-creates two sheets:
 *   "Sessions"  — one row per game session (summary)
 *   "Votes"     — one row per individual vote (detail)
 */

// ── Configuration ─────────────────────────────────────────────────────────────
/** Replace with the ID from your Google Sheet URL. */
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// ── Entry point ───────────────────────────────────────────────────────────────
/**
 * Handles POST requests sent by the game frontend.
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    appendSession(data);
    return jsonResponse({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── Sheet helpers ─────────────────────────────────────────────────────────────
/**
 * Appends session data to the spreadsheet.
 * @param {{ playerName: string, timestamp: string, votes: Array, tally: Array }} data
 */
function appendSession(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ── Sessions sheet ──────────────────────────────────────────────────────────
  const sessionsSheet = getOrCreateSheet(ss, 'Sessions', [
    'Timestamp', 'Player Name',
    'Winner (fewest votes)', 'Winner Votes',
    'Loser (most votes)',   'Loser Votes',
  ]);

  const sorted = [...data.tally].sort((a, b) => a.votes - b.votes);
  const winner = sorted[0];
  const loser  = sorted[sorted.length - 1];

  sessionsSheet.appendRow([
    data.timestamp,
    data.playerName,
    winner.name, winner.votes,
    loser.name,  loser.votes,
  ]);

  // ── Votes sheet ─────────────────────────────────────────────────────────────
  const votesSheet = getOrCreateSheet(ss, 'Votes', [
    'Timestamp', 'Player Name', 'Question #', 'Question', 'Voted For',
  ]);

  data.votes.forEach((vote, idx) => {
    votesSheet.appendRow([
      data.timestamp,
      data.playerName,
      idx + 1,
      vote.question,
      vote.manName,
    ]);
  });
}

/**
 * Returns a sheet by name, creating it with headers if it doesn't exist.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name
 * @param {string[]} headers
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Style the header row
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#f8bbd0');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Builds a JSON ContentService output.
 * @param {object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── CORS preflight (GET = healthcheck) ────────────────────────────────────────
/**
 * Responds to GET requests with a simple healthcheck.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet() {
  return jsonResponse({ status: 'ok', message: 'Hen Party Game API is running.' });
}
