import './style.css';
import * as api from './api';
import * as admin from './admin';

// --- Configuration & Constants ---
const LS_KEYS = {
  PLAYER_ID: 'hens_player_id',
  PLAYER_NAME: 'hens_player_name',
  DEVICE_TOKEN: 'hens_device_token'
};

// --- App State ---
const state = {
  gameState: 'LOADING', // LOADING, JOINING, VOTING, RESULTS, OFFLINE
  playerId: localStorage.getItem(LS_KEYS.PLAYER_ID),
  playerName: localStorage.getItem(LS_KEYS.PLAYER_NAME),
  deviceToken: '', // populated in getOrCreateDeviceToken
  answeredCount: 0,
  results: [],
  allPlayers: [],
  bachelors: ["Alfie", "Ben", "Theo", "Max", "Harry", "Tom", "Jack", "Ollie", "James", "Sam", "Ryan", "Chris", "Dom", "Luca"],
  isPolling: false,
  errorHUD: null
};

// --- Early Population ---
state.deviceToken = getOrCreateDeviceToken();

// Global Error Catcher
window.onerror = (msg, url, line) => {
  const err = `CRASH: ${msg} at ${line}`;
  console.error(err);
  const errorDiv = document.querySelector('#app');
  if (errorDiv) {
    errorDiv.innerHTML = `
      <div class="screen" style="border: 2px solid #ff4d4d; padding: 20px; background: rgba(0,0,0,0.1); color: #ff9999; font-family: monospace; font-size: 14px; white-space: pre-wrap;">
        <h1 style="color:white">Something went wrong</h1>
        <p>This is usually a pathing error or a script issue.</p>
        <hr/>
        ${err}
      </div>`;
  }
};

const app = document.querySelector('#app');

// --- Initialization ---

function getOrCreateDeviceToken() {
  let token = localStorage.getItem(LS_KEYS.DEVICE_TOKEN);
  if (!token) {
    token = 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    localStorage.setItem(LS_KEYS.DEVICE_TOKEN, token);
  }
  return token;
}

async function init() {
  // Simple check for hash-based routing
  const route = window.location.hash;
  if (route === '#admin' || route === '#/admin') {
    admin.render();
    return;
  }
  
  renderLoading();
  await poll(); // First sync
  startPolling();
  render();
}

function startPolling() {
  if (state.isPolling) return;
  state.isPolling = true;
  setInterval(poll, 4000); // 4 second intervals for stability
}

async function poll() {
  // Don't sync if we're in admin sub-view
  if (window.location.hash.includes('admin')) return;

  try {
    const data = await api.sync(state.playerId, state.deviceToken);
    const oldState = state.gameState;
    
    // Safety check for unknown states
    state.gameState = (data.state && ['JOINING', 'VOTING', 'RESULTS'].includes(data.state)) ? data.state : 'JOINING';
    
    state.answeredCount = data.answeredCount || 0;
    if (data.results) state.results = data.results;
    if (data.allPlayers) state.allPlayers = data.allPlayers;
    
    if (state.playerId && state.playerName && data.status === 'reset') {
       state.playerId = null;
       state.playerName = null;
       localStorage.clear();
       window.location.reload();
    }

    if (oldState !== state.gameState) {
      render();
    }
  } catch (e) {
    console.error("Polling error:", e);
    state.errorHUD = e.toString();
    if (state.gameState === 'LOADING') {
      state.gameState = 'OFFLINE';
      render();
    }
  }
}

// --- Router & Rendering ---

export function render() {
  if (!app) return;
  app.innerHTML = '';

  console.log('Rendering state:', state.gameState);

  switch(state.gameState) {
    case 'LOADING':
      renderLoading();
      break;
    case 'OFFLINE':
      renderOffline();
      break;
    case 'JOINING':
      if (!state.playerId) renderJoin();
      else renderWaiting('Waiting for the host to start the game');
      break;
    case 'VOTING':
      if (!state.playerId) renderJoin();
      else if (state.answeredCount < 10) renderVoting();
      else renderWaiting('All votes submitted. Waiting for results...');
      break;
    case 'RESULTS':
      renderResults();
      break;
    default:
      renderJoin(); // Fallback to join screen
  }
}

function renderLoading() {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1>The Bachelorette</h1>
        <div class="loader-dots"><span></span><span></span><span></span></div>
        <p style="margin-top: 20px; font-size: 0.8rem; opacity: 0.5;">Loading your invitation...</p>
      </div>
    </div>
  `;
}

function renderOffline() {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1>Offline</h1>
        <p>We couldn't reach the server.</p>
        <div style="font-family: monospace; font-size: 11px; margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; color: #ff6666; word-break: break-all; border-radius: 8px;">
          Error: ${state.errorHUD || 'Connection timed out'}
        </div>
        <button onclick="location.reload()" style="margin-top: 20px;">Retry connection</button>
      </div>
    </div>
  `;
}

// --- Screen Components ---

async function renderJoin() {
  const players = (state.allPlayers && state.allPlayers.length > 0)
    ? state.allPlayers 
    : ["Abbie G", "Parisa", "Alex", "Sue", "Carole", "Charlotte P", "Nicola K", "Char S", "Grace", "Ruby", "Beth", "Nicola B"];

  app.innerHTML = `
    <div class="screen">
      <div class="glass-card" style="position: relative; z-index: 600;">
        <h1>The Bachelorette</h1>
        <p>Choose your name to join the party.</p>
        
        <div style="margin: 24px 0;">
          <div class="label-pill" style="margin-bottom: 8px;">Select Guest</div>
          <select id="nameSelect">
            <option value="" disabled selected>Select from list...</option>
            ${players.map(p => {
               // Check if name is already 'claimed' (if we have that info)
               return `<option value="${p}">${p}</option>`;
            }).join('')}
          </select>
        </div>

        <button id="joinBtn" disabled style="margin-top: 20px;">Join game</button>
        <p id="joinError" style="color: #ff9999; font-size: 0.8rem; margin-top: 12px; display: none;"></p>
      </div>
    </div>
    <img src="bachelorette.png" class="bachelorette-image" style="z-index: 500;">
  `;

  const select = document.querySelector('#nameSelect');
  const btn = document.querySelector('#joinBtn');
  const err = document.querySelector('#joinError');

  select.onchange = () => {
    btn.disabled = !select.value;
  };

  btn.onclick = async () => {
    const finalName = select.value;
    if (!finalName) return;
    
    btn.disabled = true;
    btn.textContent = 'Joining...';
    err.style.display = 'none';

    try {
      const res = await api.joinPlayer(finalName, state.deviceToken);
      if (res.status === 'SUCCESS') {
        state.playerId = res.playerId;
        state.playerName = res.playerName;
        localStorage.setItem(LS_KEYS.PLAYER_ID, res.playerId);
        localStorage.setItem(LS_KEYS.PLAYER_NAME, res.playerName);
        render();
      } else {
        err.textContent = res.message || 'This name is taken.';
        err.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Join game';
      }
    } catch (e) {
      err.textContent = 'Connection error. Check your internet.';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Join game';
    }
  };
}

function renderWaiting(msg) {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1>The Bachelorette</h1>
        <p style="opacity: 0.8;">${msg}</p>
        <div style="margin-top: 32px;">
          <div style="font-family: 'Newsreader', serif; font-size: 5rem; font-weight: 700; color: var(--primary); font-style: italic; line-height: 1;">${state.answeredCount}</div>
          <div class="label-pill" style="margin-top: 8px;">OF 10 VOTES PLACED</div>
        </div>
        <div class="loader-dots" style="margin-top: 32px;"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
}

function renderResults() {
  app.innerHTML = `
    <div class="screen" style="padding: 40px 10px; max-height: none; overflow-y: auto; justify-content: flex-start;">
      <div class="glass-card">
        <h1 style="font-size: 1.5rem;">Evening Gala Results</h1>
        <p style="margin-bottom: 32px; opacity: 0.7;">The roses have been tallied.</p>
        
        <div class="results-list">
          ${state.results.map((r, i) => `
            <div class="list-row ${i === 0 ? 'winner' : ''}">
              <div class="row-label">
                <span class="rank" style="opacity: 0.5; font-size: 0.8rem; margin-right: 8px;">#${i + 1}</span>
                ${r.candidate}
              </div>
              <div class="row-value">${r.votes} votes</div>
            </div>
          `).join('') || '<p style="opacity: 0.4;">Waiting for tally...</p>'}
        </div>
        
        <button onclick="location.hash='#admin'" style="margin-top: 40px; padding: 12px;" class="ghost-btn">Host Dashboard</button>
      </div>
    </div>
  `;
}

function renderVoting() {
  const currentQIndex = state.answeredCount;
  const questions = [
    "Who’s most likely to say they’re looking for a \"high-value woman\"?",
    "Who’s most likely to say they \"don’t really like Little Wayne\"?",
    "Who’s most likely to stage a rose scavenger hunt around Hertford on your first date?",
    "Who’s most likely to ask you to stop sending voice note videos?",
    "Who’s most likely to DM a footballer \"great game today mate\"?",
    "Who’s most likely to start a podcast no one asked for?",
    "Who’s most likely to \"live\" in a dilapidated converted mechanics pit?",
    "Who’s most likely to send an unsolicited pic?",
    "Who says \"all wine tastes the same\"?",
    "Who’s most likely to have a secret subscription to Bonnie Blue’s OnlyFans?"
  ];

  const question = questions[currentQIndex];
  let selectedBachelor = null;

  app.innerHTML = `
    <div class="screen" style="padding: 40px 0; justify-content: flex-start; align-items: flex-start; max-height: none; overflow-y: auto;">
      <div class="question-header">
        <div class="label-pill">QUESTION ${currentQIndex + 1} OF 10</div>
        <h2 style="font-family: 'Newsreader', serif; font-weight: 300; font-style: italic; font-size: 2.2rem; line-height: 1.2;">
           ${question.replace(/"([^"]+)"/g, '<span style="color: var(--primary)">“$1”</span>')}
        </h2>
      </div>
      
      <div class="tile-grid">
        ${state.bachelors.map(b => `<div class="name-tile" data-name="${b}">${b}</div>`).join('')}
      </div>
      
      <footer style="width: 100%; display: flex; justify-content: center; margin-top: 48px; padding-bottom: 48px;">
        <button id="submitVote" disabled style="width: auto; padding: 0 54px; height: 64px;">Submit Vote <span>&rarr;</span></button>
      </footer>
    </div>
  `;

  document.querySelectorAll('.name-tile').forEach(tile => {
    tile.onclick = () => {
      document.querySelectorAll('.name-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      selectedBachelor = tile.getAttribute('data-name');
      document.querySelector('#submitVote').disabled = false;
    };
  });

  document.querySelector('#submitVote').onclick = async () => {
    const btn = document.querySelector('#submitVote');
    btn.disabled = true;
    btn.textContent = 'Casting...';

    try {
      const res = await api.submitVote(state.playerId, state.deviceToken, currentQIndex + 1, selectedBachelor);
      if (res.status === 'SUCCESS') {
        state.answeredCount++;
        render();
      } else {
        alert(res.message);
        btn.disabled = false;
        btn.textContent = 'Submit Vote';
      }
    } catch (e) {
      alert('Network error. Try again.');
      btn.disabled = false;
      btn.textContent = 'Submit Vote';
    }
  };
}

// --- App Start ---
window.addEventListener('hashchange', () => {
  init();
});

init();
