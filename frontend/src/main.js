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
  if (app) app.innerHTML = `<div class="screen" style="border: 2px solid #ff4d4d; padding: 20px; background: rgba(255,0,0,0.1); color: #ff9999; font-family: monospace; font-size: 12px; white-space: pre-wrap;">${err}</div>`;
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
  if (window.location.hash === '#admin' || window.location.hash === '#/admin') {
    admin.render();
    return;
  }

  if (window.location.hash === '#design-system') {
    renderDesignSystem();
    return;
  }
  
  renderLoading();
  await poll(); // Initial sync
  startPolling();
  render();
}

function startPolling() {
  if (state.isPolling) return;
  state.isPolling = true;
  setInterval(poll, 3000);
}

async function poll() {
  if (window.location.hash === '#admin' || window.location.hash === '#/admin') return;

  try {
    const data = await api.sync(state.playerId, state.deviceToken);
    const oldState = state.gameState;
    
    state.gameState = data.state;
    state.answeredCount = data.answeredCount || 0;
    if (data.results) state.results = data.results;
    if (data.allPlayers) state.allPlayers = data.allPlayers;
    
    if (state.playerId && state.playerName && !data.playerName) {
      console.log('Session reset on server. Clearing local session.');
      state.playerId = null;
      state.playerName = null;
      localStorage.removeItem(LS_KEYS.PLAYER_ID);
      localStorage.removeItem(LS_KEYS.PLAYER_NAME);
      render();
    } else if (data.playerName) {
      state.playerName = data.playerName;
    }

    if (oldState !== state.gameState) {
      render();
    }
  } catch (e) {
    console.error("Polling error", e);
    state.errorHUD = e.toString();
    if (state.gameState === 'LOADING') {
      state.gameState = 'OFFLINE';
    }
    render();
  }
}

// --- Router & Rendering ---

export function render() {
  app.innerHTML = '';

  if (window.location.hash === '#design-system') {
    renderDesignSystem();
    return;
  }

  if (state.gameState === 'LOADING') renderLoading();
  else if (state.gameState === 'OFFLINE') renderOffline();
  else if (state.gameState === 'JOINING') {
    if (!state.playerId) renderJoin();
    else renderWaiting('Waiting for the host to start the game');
  }
  else if (state.gameState === 'VOTING') {
    if (!state.playerId) renderJoin();
    else if (state.answeredCount < 10) renderVoting();
    else renderWaiting('All votes submitted. Waiting for results...');
  }
  else if (state.gameState === 'RESULTS') {
    renderResults();
  }
}

function renderLoading() {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1>The Bachelorette</h1>
        <div class="loader-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
}

function renderOffline() {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1>Offline</h1>
        <p>Something went wrong with the connection.</p>
        <div style="font-family: monospace; font-size: 12px; margin-top: 10px; color: #ff6666; word-break: break-all;">
          ${state.errorHUD || 'Unknown sync failure'}
        </div>
        <button onclick="location.reload()" style="margin-top: 20px;">Try Refreshing</button>
      </div>
    </div>
  `;
}

// --- Design System Review Screen ---

function renderDesignSystem() {
  app.innerHTML = `
    <div class="screen" style="padding: 64px 20px; max-height: none; overflow-y: auto;">
      <div class="glass-card" style="text-align: left; padding-bottom: 64px;">
        <h1>Midnight Sparkle Editorial</h1>
        <p>A high-end editorial experience.</p>
        <section style="margin-top: 48px;">
           <div class="label-pill">Action Components</div>
           <button>Primary Button</button>
        </section>
      </div>
    </div>
  `;
}

// --- Screen Components ---

async function renderJoin() {
  const players = state.allPlayers && state.allPlayers.length > 0
    ? state.allPlayers 
    : ["Abbie G", "Parisa", "Alex", "Sue", "Carole", "Charlotte P", "Nicola K", "Char S", "Grace", "Ruby", "Beth", "Nicola B"];

  app.innerHTML = `
    <div class="screen">
      <div class="glass-card" style="position: relative; z-index: 600;">
        <h1>The Bachelorette</h1>
        <p>Choose your name to join the party.</p>
        <div class="label-pill" style="margin-bottom: var(--spacing-sm); text-align: left;">Your identity</div>
        <select id="nameSelect">
          <option value="" disabled selected>Select from list...</option>
          ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <button id="joinBtn" disabled style="margin-top: 20px;">Join game</button>
      </div>
    </div>
    <img src="bachelorette.png" class="bachelorette-image" style="z-index: 500;">
  `;

  const select = document.querySelector('#nameSelect');
  const btn = document.querySelector('#joinBtn');

  select.onchange = () => {
    btn.disabled = !select.value;
  };

  btn.onclick = async () => {
    const finalName = select.value;
    if (!finalName) return;
    btn.disabled = true;
    btn.textContent = 'Joining...';
    try {
      const res = await api.joinPlayer(finalName, state.deviceToken);
      if (res.status === 'SUCCESS') {
        state.playerId = res.playerId;
        state.playerName = res.playerName;
        localStorage.setItem(LS_KEYS.PLAYER_ID, res.playerId);
        localStorage.setItem(LS_KEYS.PLAYER_NAME, res.playerName);
        render();
      } else {
        alert(res.message || 'Failed to join.');
        btn.disabled = false;
        btn.textContent = 'Join game';
      }
    } catch (e) {
      alert('Network error. Try again.');
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
        <p>${msg}</p>
        <div style="margin-top: 24px;">
          <div style="font-family: 'Newsreader', serif; font-size: 5rem; font-weight: 700; color: var(--primary); font-style: italic;">${state.answeredCount} / 10</div>
          <div class="label-pill" style="margin-top: 8px;">QUESTIONS ANSWERED</div>
        </div>
      </div>
    </div>
  `;
}

function renderResults() {
  app.innerHTML = `
    <div class="screen" style="padding: 40px 10px;">
      <div class="glass-card">
        <h1>The Results</h1>
        <div class="results-list">
          ${state.results.map((r, i) => `
            <div class="list-row ${i === 0 ? 'winner' : ''}">
              <div class="row-label">${i + 1}. ${r.candidate}</div>
              <div class="row-value">${r.votes} votes</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function formatQuestionText(text) {
  return text.replace(/"([^"]+)"/g, '<span class="italics-emphasis">“$1”</span>');
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
  const formattedQuestion = formatQuestionText(question);
  let selectedBachelor = null;

  app.innerHTML = `
    <div class="screen" style="padding: 40px 0; justify-content: flex-start; align-items: flex-start;">
      <div class="question-header">
        <div class="label-pill">QUESTION ${currentQIndex + 1} OF 10</div>
        <h2>${formattedQuestion}</h2>
      </div>
      <div class="tile-grid">
        ${state.bachelors.map((b, i) => `<div class="name-tile" data-name="${b}">${b}</div>`).join('')}
      </div>
      <footer style="width: 100%; display: flex; justify-content: center; margin-top: 32px;">
        <button id="submitVote" disabled style="width: auto; padding: 0 54px;">Submit Answer <span>&rarr;</span></button>
      </footer>
    </div>
  `;

  document.querySelectorAll('.name-tile').forEach(tile => {
    tile.onclick = () => {
      document.querySelectorAll('.name-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      selectedBachelor = tile.getAttribute('data-name');
      const subBtn = document.querySelector('#submitVote');
      subBtn.disabled = false;
    };
  });

  document.querySelector('#submitVote').onclick = async () => {
    state.answeredCount++;
    render();
    try {
      await api.submitVote(state.playerId, state.deviceToken, currentQIndex + 1, selectedBachelor);
    } catch (e) {
      state.answeredCount--;
      render();
      alert('Failed to submit vote.');
    }
  };
}

// --- App Start ---
window.addEventListener('hashchange', () => {
  window.location.reload();
});

init();
