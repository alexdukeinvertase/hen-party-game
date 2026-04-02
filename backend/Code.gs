/** 
 * Hens Game App — Version 29 (Production + Auto-Detect)
 * ID: 12vAFai2szkg9C92Qt2XVa_UjG7rGcuo-L0DEjEmIsrs
 */

const HOST_CODE = 'HEN2026';
const SPREADSHEET_ID = '12vAFai2szkg9C92Qt2XVa_UjG7rGcuo-L0DEjEmIsrs';

// --- Entry Points ---

function doGet(e) {
  if (e.parameter.action === 'PING') return jsonResponse({ status: 'PONG' });
  return handleSync(e.parameter.playerId, e.parameter.token);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'join') return handleJoin(body.name, body.deviceToken);
    if (action === 'sync') return handleSync(body.playerId, body.token);
    if (action === 'vote') return handleVote(body.playerId, body.token, body.questionId, body.selection);
    if (action === 'adminControl') {
      return handleAdminControl(body.hostCode, body.newState, body.targetPlayer, body.adminAction);
    }
    
    return jsonResponse({ status: 'error', message: 'Unknown POST action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// --- Player Handlers ---

function handleJoin(name, deviceToken) {
  const sheet = findBestSheet('Players');
  const data = sheet.getDataRange().getValues();
  const target = String(name || '').trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      const playerId = data[i][1] || Utilities.getUuid();
      sheet.getRange(i + 1, 2).setValue(playerId); 
      sheet.getRange(i + 1, 3).setValue(deviceToken); 
      sheet.getRange(i + 1, 4).setValue(new Date()); 
      SpreadsheetApp.flush();
      return jsonResponse({ status: 'SUCCESS', playerId, playerName: name });
    }
  }
  return jsonResponse({ status: 'error', message: 'Name not found in sheet row 2 onwards.' });
}

function handleSync(playerId, token) {
  const sheet = findBestSheet('Players');
  const data = sheet.getDataRange().getValues();
  const state = getSetting('GAME_STATE') || 'JOINING';
  const response = { state: state };
  
  if (playerId && token) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]) === String(playerId)) {
        response.playerName = data[i][0];
        response.answeredCount = getAnsweredCount(playerId);
      }
    }
  }
  
  if (state === 'RESULTS') response.results = calculateResults();
  
  response.allPlayers = data.slice(1).map(row => row[0]).filter(Boolean);
  
  response.debug = {
    sheetFound: sheet.getName(),
    playerCount: response.allPlayers.length,
    targetId: SPREADSHEET_ID.substring(0, 5) + "..."
  };
  
  return jsonResponse(response);
}

function handleVote(playerId, token, questionId, selection) {
  try {
    const sheet = getOrCreateSheet('Answers');
    sheet.appendRow([playerId, String(questionId), selection, new Date()]);
    return jsonResponse({ status: 'SUCCESS' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// --- Admin Handlers ---

function handleAdminControl(hostCode, newState, targetPlayer, adminAction) {
  if (String(hostCode || '').trim().toUpperCase() !== HOST_CODE) {
    return jsonResponse({ status: 'error', message: 'Invalid host code' });
  }

  try {
    if (newState) {
      setSetting('GAME_STATE', newState);
      return jsonResponse({ status: 'SUCCESS', state: newState });
    }

    if (adminAction === 'getAdminStatus') {
      return jsonResponse({
        state: getSetting('GAME_STATE') || 'JOINING',
        players: getAdminPlayerList()
      });
    }

    return jsonResponse({ status: 'error', message: 'Unknown admin action: ' + adminAction });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function getAdminPlayerList() {
  const sheet = findBestSheet('Players');
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

// --- Logic & Database Helpers ---

function calculateResults() {
  const answers = getOrCreateSheet('Answers').getDataRange().getValues();
  const players = findBestSheet('Players').getDataRange().getValues();
  const playerMap = {};
  players.slice(1).forEach(r => playerMap[r[1]] = r[0]);

  const scores = {};
  // Find latest vote for each question
  const uniqueVotes = {};
  answers.slice(1).forEach(r => {
    const voter = playerMap[r[0]]; // Translate ID to Name
    const choice = r[2];
    uniqueVotes[r[0] + '-' + r[1]] = choice;
  });
  
  Object.values(uniqueVotes).forEach(choice => {
    scores[choice] = (scores[choice] || 0) + 1;
  });

  return Object.keys(scores).map(name => ({ candidate: name, votes: scores[name] }))
    .sort((a,b) => b.votes - a.votes);
}

function getAnsweredCount(playerId) {
  const data = getOrCreateSheet('Answers').getDataRange().getValues();
  return [...new Set(data.slice(1).filter(r => r[0] === playerId).map(v => v[1]))].length;
}

function findBestSheet(targetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Try exact name first
  let s = ss.getSheetByName(targetName);
  if (s && s.getLastRow() > 1) return s;
  
  // 2. Look for any sheet that has data in Column A that looks like Names
  const sheets = ss.getSheets();
  for (let sheet of sheets) {
    if (sheet.getLastRow() > 1 && String(sheet.getRange(1,1).getValue()).toLowerCase().includes('name')) {
      return sheet;
    }
  }
  
  // 3. Fallback to just creating it
  if (!s) s = ss.insertSheet(targetName);
  return s;
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

let _settingsCache = null;

function getSetting(key) {
  if (!_settingsCache) {
    _settingsCache = {};
    const data = getOrCreateSheet('Config').getDataRange().getValues();
    data.forEach(r => _settingsCache[r[0]] = r[1]);
  }
  return _settingsCache[key] || null;
}

function setSetting(key, value) {
  const sheet = getOrCreateSheet('Config');
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i+1, 2).setValue(value);
      _settingsCache = null;
      SpreadsheetApp.flush();
      return;
    }
  }
  sheet.appendRow([key, value]);
  _settingsCache = null;
  SpreadsheetApp.flush();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  getOrCreateSheet('Config');
  getOrCreateSheet('Players');
  getOrCreateSheet('Answers');
  setSetting('GAME_STATE', 'JOINING');
  SpreadsheetApp.flush();
}
