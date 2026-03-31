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
  deviceToken: getOrCreateDeviceToken(),
  answeredCount: 0,
  results: [],
  allPlayers: [],
  bachelors: ["Alfie", "Ben", "Theo", "Max", "Harry", "Tom", "Jack", "Ollie", "James", "Sam", "Ryan", "Chris", "Dom", "Luca"],
  isPolling: false
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
    
    // Auto-fix for server resets: 
    // If server no longer recognizes our ID, clear local cache and re-render
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
        <div class="label-pill" style="margin-bottom: 8px;">Design System</div>
        <h1>Midnight Sparkle Editorial</h1>
        <p>A high-end editorial experience featuring Newsreader and Manrope.</p>

        <section style="margin-top: 48px;">
          <div class="label-pill">Gala Question Preview</div>
          <div class="question-header" style="margin-bottom: 24px;">
            <div class="label-pill">Question 1 of 10</div>
            <h2>Who is most likely to say they are looking for a <span class="italics-emphasis">“high-value woman”</span>?</h2>
          </div>
          <div class="tile-grid">
            <div class="name-tile selected">Alfie</div>
            <div class="name-tile">Ben</div>
            <div class="name-tile">Theo</div>
            <div class="name-tile">Max</div>
            <div class="name-tile">Luca</div>
          </div>
        </section>
        
        <section style="margin-top: 48px;">
          <div class="label-pill">Typography</div>
          <h1>Header 1 Italic</h1>
          <h2>Header 2 Regular</h2>
          <h3>Header 3 Regular</h3>
          <p>This is a paragraph using Manrope. It should feel airy and clean with high legibility. The line height is set to 1.6.</p>
        </section>

        <section style="margin-top: 48px;">
          <div class="label-pill">Action Components</div>
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
            <button>Primary Button Gradient</button>
            <button disabled>Disabled State</button>
            <div style="display: flex; gap: 8px;">
              <button class="ghost-btn">Secondary Ghost</button>
              <button class="reset-btn">Reset Style</button>
            </div>
          </div>
        </section>

        <section style="margin-top: 48px;">
          <div class="label-pill">Form Elements</div>
          <div style="margin-top: 16px;">
            <label>Name Selection</label>
            <select>
              <option>Sample Selected Input</option>
              <option>Option 2</option>
            </select>
            <label>Text Input</label>
            <input type="text" placeholder="Type something expensive...">
          </div>
        </section>

        <section style="margin-top: 48px;">
          <div class="label-pill">Selection Tiles</div>
          <div class="tile-grid" style="margin-top: 16px;">
            <div class="name-tile">Bachelor A</div>
            <div class="name-tile selected">Selected Tile</div>
            <div class="name-tile">Bachelor C</div>
          </div>
        </section>

        <section style="margin-top: 48px;">
          <div class="label-pill">Results Rows</div>
          <div class="results-list" style="margin-top: 16px;">
            <div class="list-row winner">
              <div class="row-label">1. Sample Winner</div>
              <div class="row-value">24 votes</div>
            </div>
            <div class="list-row">
              <div class="row-label">2. Runner Up</div>
              <div class="row-value">12 votes</div>
            </div>
          </div>
        </section>
        
        <p style="margin-top: 48px; font-size: 0.8rem; opacity: 0.5;">End of Design Review.</p>
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
      <div class="glass-card">
        <h1>The Bachelorette</h1>
        <p>Choose your name to join the party.</p>
        
        <div class="label-pill" style="margin-bottom: var(--spacing-sm); text-align: left;">Your identity</div>
        <select id="nameSelect">
          <option value="" disabled selected>Select from list...</option>
          ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        
        <button id="joinBtn" disabled style="margin-top: 20px;">Join game</button>
        <p style="margin-top: 24px; font-size: 0.8rem; color: var(--text-muted);">Persistence is stored locally on this device.</p>
      </div>
    </div>
    <img src="/hen-party-game/bachelorette.png" class="bachelorette-image">
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
    <div class="screen" style="padding: 40px 0;">
      <div class="glass-card">
        <h1>The Results</h1>
        <p style="margin-bottom: 30px; opacity: 0.7;">Who is husband material?</p>
        
        <div class="results-list">
          ${state.results.map((r, i) => `
            <div class="list-row ${i === 0 ? 'winner' : ''}">
              <div class="row-label">${i + 1}. ${r.name}</div>
              <div class="row-value">${r.votes} votes</div>
            </div>
          `).join('')}
        </div>

        <p style="margin-top: 30px; font-style: italic; font-size: 0.9rem;">Thanks for playing!</p>
      </div>
    </div>
  `;
}

function formatQuestionText(text) {
  // Wrap words in quotes with editorial italics-emphasis span
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
        ${state.bachelors.map((b, i) => {
          return `<div class="name-tile" data-name="${b}">${b}</div>`;
        }).join('')}
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
      subBtn.innerHTML = 'Submit Answer <span>&rarr;</span>';
    };
  });

  document.querySelector('#submitVote').onclick = async () => {
    // Optimistic Update: Move to next question immediately
    state.answeredCount++;
    render();

    // Background Request: Send the vote
    try {
      const res = await api.submitVote(state.playerId, state.deviceToken, currentQIndex + 1, selectedBachelor);
      
      if (res.status !== 'SUCCESS') {
        // Rollback on failure
        state.answeredCount--;
        render();
        alert('Failed to submit vote. Please try again.');
      }
    } catch (e) {
      state.answeredCount--;
      render();
      alert('Network error. Your vote was not saved.');
    }
  };
}

// --- App Start ---
window.addEventListener('hashchange', () => {
  window.location.reload();
});

init();
