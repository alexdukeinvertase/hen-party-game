/** 
 * Hens Game App — Finalized Backend (Google Apps Script)
 * Version: 22 (Cleaned & Logged)
 */

function manualTestRemove() {
  // 1. Ensure someone named 'Alex' is joined in your sheet
  // 2. Select this function in the toolbar above and click 'Run'
  // 3. Check the sheet. Alex should be removed and a 🚀 log should appear.
  const LOG_PIN = 'HEN2026';
  const TARGET = 'Alex';
  const RESULT = handleAdminControl(LOG_PIN, null, TARGET, 'resetName');
  Logger.log(RESULT);
}

const HOST_CODE = 'HEN2026';
const SPREADSHEET_ID = '12vAFai2szkg9C92Qt2XVa_UjG7rGcuo-L0DEjEmIsrs';

// --- Entry Points ---

function doGet(e) {
  const action = e.parameter.action;
  debugLog('GET Action: ' + action);

  if (action === 'PING') return jsonResponse({ status: 'PONG' });
  if (action === 'sync') return handleSync(e.parameter.playerId, e.parameter.token);
  
  return jsonResponse({ status: 'error', message: 'Unknown GET action: ' + action });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      debugLog('ERROR: Empty POST body');
      return jsonResponse({ status: 'error', message: 'No body received' });
    }
    
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    debugLog('POST Action: ' + action);

    if (action === 'join') return handleJoin(body.name, body.deviceToken);
    if (action === 'sync') return handleSync(body.playerId, body.token);
    if (action === 'vote') return handleVote(body.playerId, body.token, body.questionId, body.selection);
    if (action === 'adminControl') {
      return handleAdminControl(body.hostCode, body.newState, body.targetPlayer, body.adminAction);
    }

    return jsonResponse({ status: 'error', message: 'Unknown POST action: ' + action });
  } catch (err) {
    debugLog('FATAL: ' + err.toString());
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// --- Admin Handlers ---

function handleAdminControl(hostCode, newState, targetPlayer, adminAction) {
  debugLog('Auth for ' + adminAction + ' with ' + hostCode);
  
  if (hostCode !== HOST_CODE) {
    debugLog('AUTH FAILED: ' + hostCode + ' !== ' + HOST_CODE);
    return jsonResponse({ status: 'error', message: 'Invalid host code' });
  }

  try {
    if (newState) {
      setSetting('GAME_STATE', newState);
      return jsonResponse({ status: 'SUCCESS', state: newState });
    }

    if (adminAction === 'resetName' && targetPlayer) {
      const sheet = getOrCreateSheet('Players');
      const data = sheet.getDataRange().getValues();
      const clean = (s) => String(s || '').replace(/\s/g, '').toLowerCase();
      const target = clean(targetPlayer);

      for (let i = 1; i < data.length; i++) {
        if (clean(data[i][0]) === target) {
          const original = data[i][0];
          const maxCols = sheet.getMaxColumns();
          const clearCols = Math.min(4, maxCols > 1 ? maxCols - 1 : 0);
          if (clearCols > 0) {
            sheet.getRange(i + 1, 2, 1, clearCols).clearContent();
          }
          SpreadsheetApp.flush();
          debugLog('RESET SUCCESS: ' + original);
          return jsonResponse({ status: 'SUCCESS', message: 'Restored ' + original });
        }
      }
      return jsonResponse({ status: 'error', message: 'Name not found: ' + targetPlayer });
    }

    if (adminAction === 'NUCLEAR_RESET') {
      clearSheetData('Players', false); // Delete everything
      clearSheetData('Answers', false); 
      setSetting('GAME_STATE', 'JOINING');
      setup(); // Re-populate with defaults
      return jsonResponse({ status: 'SUCCESS', message: 'Game fully reset to original state' });
    }

    if (adminAction === 'fullReset') {
      clearSheetData('Players', true); // Preserve Column A names
      clearSheetData('Answers', false); 
      setSetting('GAME_STATE', 'JOINING');
      return jsonResponse({ status: 'SUCCESS', message: 'Game fully reset' });
    }

    if (adminAction === 'getAdminStatus') {
      return jsonResponse({
        state: getSetting('GAME_STATE') || 'JOINING',
        players: getAdminPlayerList()
      });
    }

    return jsonResponse({ status: 'error', message: 'Unknown admin action: ' + adminAction });
  } catch (err) {
    debugLog('ADMIN ERR: ' + err.toString());
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// --- Player Handlers ---

function handleSync(playerId, token) {
  const state = getSetting('GAME_STATE') || 'JOINING';
  const response = { state: state };

  if (playerId && token) {
    const player = getPlayer(playerId);
    debugLog('Sync for ' + playerId + ' (' + (player ? player.name : 'NOT FOUND') + ') with token ' + token);
    if (player && player.deviceToken === token) {
      response.playerName = player.name;
      response.answeredCount = getAnsweredCount(playerId);
    } else if (player) {
      debugLog('Token mismatch: ' + player.deviceToken + ' !== ' + token);
    }
  }

  if (state === 'RESULTS') response.results = calculateResults();
  
  // Always send the list of registered names for the joining screen
  response.allPlayers = getRegisteredNames();
  
  return jsonResponse(response);
}

function getRegisteredNames() {
  try {
    const sheet = getOrCreateSheet('Players');
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    return data.slice(1).map(row => row[0]).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function handleJoin(name, deviceToken) {
  const sheet = getOrCreateSheet('Players');
  const data = sheet.getDataRange().getValues();
  const clean = (s) => String(s || '').trim().toLowerCase();
  const target = clean(name);
  
  for (let i = 1; i < data.length; i++) {
    if (clean(data[i][0]) === target) {
      if (!data[i][2]) { // Column C is index 2
        const playerId = Utilities.getUuid();
        sheet.getRange(i + 1, 2).setValue(playerId); // Column B
        sheet.getRange(i + 1, 3).setValue(deviceToken); // Column C
        sheet.getRange(i + 1, 4).setValue(new Date()); // Column D
        SpreadsheetApp.flush();
        return jsonResponse({ status: 'SUCCESS', playerId, playerName: name });
      } else if (data[i][2] === deviceToken) {
        return jsonResponse({ status: 'SUCCESS', playerId: data[i][1], playerName: name });
      } else {
        return jsonResponse({ status: 'error', message: 'Name already claimed' });
      }
    }
  }
  
  // If name not found, append a new row for them
  const playerId = Utilities.getUuid();
  sheet.appendRow([name, playerId, deviceToken, new Date(), ""]);
  SpreadsheetApp.flush();
  return jsonResponse({ status: 'SUCCESS', playerId, playerName: name });
}

function handleVote(playerId, token, questionId, selection) {
  // 1. Fast path: Minimal session check
  const player = getPlayer(playerId);
  if (!player || player.deviceToken !== token) return jsonResponse({ status: 'error', message: 'Invalid session' });

  // 2. Append answer (Fastest way to write)
  const sheet = getOrCreateSheet('Answers');
  sheet.appendRow([playerId, String(questionId), selection, new Date()]);

  // 3. Return immediately. We don't need to check for completion here
  // as the frontend will sync later anyway.
  return jsonResponse({ status: 'SUCCESS' });
}

// --- Logic & Database Helpers ---

function calculateResults() {
  const answers = getOrCreateSheet('Answers').getDataRange().getValues();
  const players = getOrCreateSheet('Players').getDataRange().getValues();
  const playerMap = {};
  players.slice(1).forEach(r => playerMap[r[1]] = r[0]);

  const scores = {};
  answers.slice(1).forEach(r => {
    const voter = playerMap[r[0]];
    const choice = r[2];
    if (!scores[choice]) scores[choice] = 0;
    scores[choice]++;
  });

  return Object.keys(scores).map(name => ({ candidate: name, votes: scores[name] }))
    .sort((a,b) => b.votes - a.votes);
}

function getAdminPlayerList() {
  const sheet = getOrCreateSheet('Players');
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  return data.slice(1)
    .filter(row => String(row[3] || '').trim() !== '') // JoinedAt column
    .map(row => ({
      name: row[0],
      joined: true,
      completed: String(row[4] || '').trim() !== '',
      conflict: false
    }));
}

function getPlayer(playerId) {
  const data = getOrCreateSheet('Players').getDataRange().getValues();
  const targetId = String(playerId || '').trim();
  for (let i = 1; i < data.length; i++) {
    const sheetId = String(data[i][1] || '').trim();
    if (sheetId === targetId) return { name: data[i][0], deviceToken: String(data[i][2] || '').trim() };
  }
  return null;
}

function getAnsweredCount(playerId) {
  const data = getOrCreateSheet('Answers').getDataRange().getValues();
  return data.slice(1).filter(r => r[0] === playerId).length;
}

function updatePlayerCompletion(playerId) {
  const sheet = getOrCreateSheet('Players');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === playerId) {
      sheet.getRange(i+1, 5).setValue(new Date());
      SpreadsheetApp.flush();
      return;
    }
  }
}

function clearSheetData(name, preserveNames) {
  const sheet = getOrCreateSheet(name);
  const last = sheet.getLastRow();
  if (last < 2) return;
  
  if (preserveNames) {
    const maxCols = sheet.getMaxColumns();
    const colsToClear = Math.min(4, maxCols > 1 ? maxCols - 1 : 0);
    if (colsToClear > 0) {
      sheet.getRange(2, 2, last - 1, colsToClear).clearContent();
    }
  } else {
    sheet.deleteRows(2, last - 1);
  }
  SpreadsheetApp.flush();
}

function getSetting(key) {
  const data = getOrCreateSheet('Config').getDataRange().getValues();
  for (let i = 0; i < data.length; i++) if (data[i][0] === key) return data[i][1];
  return null;
}

function setSetting(key, value) {
  const sheet = getOrCreateSheet('Config');
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i+1, 2).setValue(value);
      SpreadsheetApp.flush();
      return;
    }
  }
  sheet.appendRow([key, value]);
  SpreadsheetApp.flush();
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function debugLog(msg) {
  try {
    console.log(msg);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet('Logs');
    
    // Add new log at the top (Insert after header)
    sheet.appendRow([new Date(), '🚀 ' + String(msg)]);
    
    // Keep it tidy: Trim to last 200 logs if it gets too long
    const lastRow = sheet.getLastRow();
    if (lastRow > 210) {
      sheet.deleteRows(2, lastRow - 200);
    }
  } catch (e) {
    console.error('Logging failed: ' + e.toString());
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  getOrCreateSheet('Config');
  const playerSheet = getOrCreateSheet('Players');
  getOrCreateSheet('Answers');
  getOrCreateSheet('Bachelors');
  getOrCreateSheet('Questions');

  // Pre-populate players if empty
  if (playerSheet.getLastRow() < 2) {
    const players = [
      ["Abbie G"], ["Parisa"], ["Alex"], ["Sue"], ["Carole"], ["Charlotte P"],
      ["Nicola K"], ["Char S"], ["Grace"], ["Ruby"], ["Beth"], ["Nicola B"]
    ];
    playerSheet.getRange(1, 1).setValue("Name");
    playerSheet.getRange(1, 2).setValue("ID");
    playerSheet.getRange(1, 3).setValue("Token");
    playerSheet.getRange(1, 4).setValue("JoinedAt");
    playerSheet.getRange(1, 5).setValue("CompletedAt");
    playerSheet.getRange(2, 1, players.length, 1).setValues(players);
    SpreadsheetApp.flush();
  }
}
