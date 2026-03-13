/**
 * Hens Game App — Backend Specification (Google Apps Script)
 * Handles player join claims, voting, and admin control.
 */

// The game's host PIN. For deployed environments, set this securely via Apps Script settings: 
// Project Settings (gear icon) -> Script Properties -> Add property 'HOST_CODE'
const HOST_CODE = PropertiesService.getScriptProperties().getProperty('HOST_CODE') || '123456'; 


/**
 * Run this function once in the Apps Script editor to initialize all sheets.
 */
function setup() {
  getOrCreateSheet('Config');
  getOrCreateSheet('Players');
  getOrCreateSheet('Answers');
  getOrCreateSheet('Bachelors');
  getOrCreateSheet('Questions');
  console.log('Sheet initialization complete.');
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'sync') {
    return handleSync(e.parameter.playerId, e.parameter.token);
  }
  
  return jsonResponse({ status: 'error', message: 'Unknown GET action' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ status: 'error', message: 'Invalid JSON body' });
  }

  const action = body.action;

  if (action === 'join') {
    return handleJoin(body.name, body.deviceToken);
  }

  if (action === 'vote') {
    return handleVote(body.playerId, body.token, body.questionId, body.selection);
  }

  if (action === 'adminControl') {
    return handleAdminControl(body.hostCode, body.newState, body.targetPlayer, body.adminAction);
  }

  return jsonResponse({ status: 'error', message: 'Unknown POST action' });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Action Handlers ---

function handleSync(playerId, token) {
  const state = getSetting('GAME_STATE') || 'JOINING';
  const response = { state: state };

  if (playerId && token) {
    const player = getPlayer(playerId);
    if (player && player.deviceToken === token) {
      response.playerName = player.name;
      response.answeredCount = getAnsweredCount(playerId);
    }
  }

  if (state === 'RESULTS') {
    response.results = calculateResults();
  }

  // Admin might want the full player list
  if (state === 'VOTING' || state === 'JOINING') {
     // We can optimize this later if needed
  }

  return jsonResponse(response);
}

function handleJoin(name, deviceToken) {
  if (!name || !deviceToken) return jsonResponse({ status: 'error', message: 'Name and DeviceToken required' });

  const playersSheet = getOrCreateSheet('Players');
  const playersData = playersSheet.getDataRange().getValues();
  
  // Check if name is already claimed
  for (let i = 1; i < playersData.length; i++) {
    if (playersData[i][0] === name) {
      const existingId = playersData[i][1];
      const existingToken = playersData[i][2];
      
      if (existingToken === deviceToken) {
        return jsonResponse({ status: 'SUCCESS', playerId: existingId, playerName: name });
      } else {
        return jsonResponse({ status: 'BLOCKED', message: 'Name already in use on another device.' });
      }
    }
  }

  // Unclaimed: Register new player
  const playerId = Utilities.getUuid();
  playersSheet.appendRow([name, playerId, deviceToken, new Date(), '']);
  return jsonResponse({ status: 'SUCCESS', playerId: playerId, playerName: name });
}

function handleVote(playerId, token, questionId, selection) {
  if (!playerId || !token || !questionId || !selection) {
    return jsonResponse({ status: 'error', message: 'Missing voting parameters' });
  }

  const player = getPlayer(playerId);
  if (!player || player.deviceToken !== token) {
    return jsonResponse({ status: 'error', message: 'Invalid session' });
  }

  const answersSheet = getOrCreateSheet('Answers');
  const answersData = answersSheet.getDataRange().getValues();

  // Prevent duplicate submission
  for (let i = 1; i < answersData.length; i++) {
    if (answersData[i][0] === playerId && answersData[i][1] === questionId) {
      return jsonResponse({ status: 'error', message: 'Duplicate submission' });
    }
  }

  answersSheet.appendRow([playerId, questionId, selection, new Date()]);
  
  // Check if all 10 are done
  if (getAnsweredCount(playerId) >= 10) {
    updatePlayerCompletion(playerId);
  }

  return jsonResponse({ status: 'SUCCESS' });
}

function handleAdminControl(hostCode, newState, targetPlayer, adminAction) {
  if (hostCode !== HOST_CODE) return jsonResponse({ status: 'error', message: 'Invalid host code' });

  if (newState) {
    setSetting('GAME_STATE', newState);
    return jsonResponse({ status: 'SUCCESS', state: newState });
  }

  if (adminAction === 'resetName' && targetPlayer) {
    const sheet = getOrCreateSheet('Players');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === targetPlayer) {
        sheet.getRange(i + 1, 3).setValue(''); // Clear DeviceToken
        return jsonResponse({ status: 'SUCCESS' });
      }
    }
  }

  if (adminAction === 'getAdminStatus') {
    return jsonResponse({
      state: getSetting('GAME_STATE') || 'JOINING',
      players: getAdminPlayerList()
    });
  }

  return jsonResponse({ status: 'error', message: 'Unknown admin action' });
}

// --- Helper Functions ---

function getSetting(key) {
  const sheet = getOrCreateSheet('Config');
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function setSetting(key, value) {
  const sheet = getOrCreateSheet('Config');
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function getPlayer(playerId) {
  const sheet = getOrCreateSheet('Players');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === playerId) {
      return {
        name: data[i][0],
        playerId: data[i][1],
        deviceToken: data[i][2]
      };
    }
  }
  return null;
}

function getAnsweredCount(playerId) {
  const sheet = getOrCreateSheet('Answers');
  const data = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === playerId) count++;
  }
  return count;
}

function updatePlayerCompletion(playerId) {
  const sheet = getOrCreateSheet('Players');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === playerId) {
      sheet.getRange(i + 1, 5).setValue(new Date());
      break;
    }
  }
}

function getAdminPlayerList() {
  const sheet = getOrCreateSheet('Players');
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => ({
    name: row[0],
    joined: !!row[3],
    completed: !!row[4],
    conflict: false // Placeholder for conflict detection if needed
  }));
}

function calculateResults() {
  const sheet = getOrCreateSheet('Answers');
  const data = sheet.getDataRange().getValues();
  const counts = {};
  
  for (let i = 1; i < data.length; i++) {
    const name = data[i][2];
    counts[name] = (counts[name] || 0) + 1;
  }
  
  const sorted = Object.keys(counts).map(name => ({
    name: name,
    votes: counts[name]
  })).sort((a, b) => b.votes - a.votes);
  
  return sorted;
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Config') {
      sheet.appendRow(['Key', 'Value']);
      sheet.appendRow(['GAME_STATE', 'JOINING']);
      sheet.appendRow(['HOST_CODE', HOST_CODE]);
    } else if (name === 'Players') {
      sheet.appendRow(['Name', 'PlayerID', 'DeviceToken', 'JoinedAt', 'CompletedAt']);
    } else if (name === 'Answers') {
      sheet.appendRow(['PlayerID', 'QuestionID', 'Selection', 'Timestamp']);
    } else if (name === 'Bachelors') {
      sheet.appendRow(['Name']);
      const bachelors = ["Alfie", "Ben", "Theo", "Max", "Harry", "Tom", "Jack", "Ollie", "James", "Sam", "Ryan", "Chris", "Dom", "Luca"];
      bachelors.forEach(b => sheet.appendRow([b]));
    } else if (name === 'Questions') {
      sheet.appendRow(['ID', 'Text']);
      const questions = [
        [1, "Who’s most likely to say they’re looking for a “high-value woman”?"],
        [2, "Who’s most likely to say they “don’t really like Little Wayne”?"],
        [3, "Who’s most likely to stage a rose scavenger hunt around Hertford on your first date?"],
        [4, "Who’s most likely to ask you to stop sending voice note videos?"],
        [5, "Who’s most likely to DM a footballer “great game today mate”?"],
        [6, "Who’s most likely to start a podcast no one asked for?"],
        [7, "Who’s most likely to “live” in a dilapidated converted mechanics pit?"],
        [8, "Who’s most likely to send an unsolicited pic?"],
        [9, "Who says “all wine tastes the same”?"],
        [10, "Who’s most likely to have a secret subscription to Bonnie Blue’s OnlyFans?"]
      ];
      questions.forEach(q => sheet.appendRow(q));
    }
  }
  return sheet;
}
