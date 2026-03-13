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
  questions: [], // We can fetch these or keep them static
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
  // Immediately show loading state while waiting for the first backend response
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
  // Don't poll on admin route
  if (window.location.hash === '#admin' || window.location.hash === '#/admin') return;

  const data = await api.sync(state.playerId, state.deviceToken);
  
  const oldState = state.gameState;
  state.gameState = data.state;
  state.answeredCount = data.answeredCount || 0;
  
  if (data.results) state.results = data.results;
  if (data.playerName) state.playerName = data.playerName;

  // If state changed or progress changed, re-render
  if (oldState !== state.gameState) {
    render();
  }
}

// --- Router & Rendering ---

export function render() {
  app.innerHTML = '';
  
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
  app.innerHTML = '<div class="screen"><div class="glass-card"><h1>Loading...</h1></div></div>';
}

function renderOffline() {
  app.innerHTML = '<div class="screen"><div class="glass-card"><h1>Offline</h1><p>Connection lost.</p></div></div>';
}

// --- Screen Components (Detailed) ---

async function renderJoin() {
  const players = [
    "Abbie G", "Parisa", "Alex", "Sue", "Carole", "Charlotte P", 
    "Nicola K", "Char S", "Grace", "Ruby", "Beth", "Nicola B"
  ];

  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1 style="font-family: 'Playfair Display', serif;">The Bachelorette</h1>
        <p style="margin-bottom: 25px;">Choose your name to join the game.</p>
        
        <div style="text-align: left; margin-bottom: 10px; font-weight: 600; color: var(--primary-pink);">Your name</div>
        <select id="nameSelect" style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--soft-rose); background: rgba(255,255,255,0.8); font-size: 1rem; margin-bottom: 20px;">
          <option value="" disabled selected>Select from list...</option>
          ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        
        <button id="joinBtn" disabled>Join game</button>
        <p style="margin-top: 15px; font-size: 0.85rem; color: #666;">Only people who join will be counted in the game.</p>
      </div>
    </div>
  `;

  const select = document.querySelector('#nameSelect');
  const btn = document.querySelector('#joinBtn');

  select.onchange = () => {
    btn.disabled = !select.value;
  };

  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = 'Joining...';
    
    const res = await api.joinPlayer(select.value, state.deviceToken);
    
    if (res.status === 'SUCCESS') {
      state.playerId = res.playerId;
      state.playerName = res.playerName;
      localStorage.setItem(LS_KEYS.PLAYER_ID, res.playerId);
      localStorage.setItem(LS_KEYS.PLAYER_NAME, res.playerName);
      render(); // Will show Rules or Waiting
    } else if (res.status === 'BLOCKED') {
      alert(res.message);
      btn.disabled = false;
      btn.textContent = 'Join game';
    } else {
      alert('Failed to join. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Join game';
    }
  };
}

function renderWaiting(msg) {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1 style="font-family: 'Playfair Display', serif;">The Bachelorette</h1>
        <p style="margin: 20px 0;">${msg}</p>
        <div style="margin-top: 20px;">
          <div style="font-size: 2rem; font-weight: 700; color: var(--primary-pink);">${state.answeredCount} / 10</div>
          <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.7;">QUESTIONS ANSWERED</p>
        </div>
      </div>
    </div>
  `;
}

function renderRules() {
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h2 style="font-family: 'Playfair Display', serif;">The Rules</h2>
        <ul style="text-align: left; margin: 20px 0; line-height: 1.6;">
          <li>There are 10 rounds of voting.</li>
          <li>In each round, you'll see a "Most Likely To..." prompt.</li>
          <li>Choose the bachelor from the grid that best fits the description.</li>
          <li>Results will be revealed by the host at the end!</li>
        </ul>
        <p style="font-weight: 600; color: var(--primary-pink); margin-bottom: 20px;">Wait for the host to start the voting.</p>
        <div class="loader-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
}

function renderResults() {
  app.innerHTML = `
    <div class="screen" style="max-height: none; padding: 40px 0;">
      <div class="glass-card" style="width: 90%; max-width: 450px;">
        <h1 style="font-family: 'Playfair Display', serif;">The Results</h1>
        <p style="margin-bottom: 30px;">Who is husband material?</p>
        
        <div class="results-list" style="text-align: left;">
          ${state.results.map((r, i) => `
            <div class="result-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: ${i === 0 ? 'rgba(236, 19, 91, 0.1)' : 'rgba(255,255,255,0.4)'}; border-radius: 12px; margin-bottom: 10px; border: 1px solid ${i === 0 ? 'var(--primary-pink)' : 'var(--soft-rose)'}">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 700; opacity: ${i < 3 ? '1' : '0.5'};">${i + 1}.</span>
                <span style="font-weight: 600;">${r.name}</span>
              </div>
              <span style="font-weight: 700; color: var(--primary-pink);">${r.votes} votes</span>
            </div>
          `).join('')}
        </div>

        <p style="margin-top: 30px; font-style: italic; font-size: 0.9rem;">Thanks for playing!</p>
      </div>
    </div>
  `;
}

function renderVoting() {
  const currentQIndex = state.answeredCount;
  const questions = [
    "Who’s most likely to say they’re looking for a “high-value woman”?",
    "Who’s most likely to say they “don’t really like Little Wayne”?",
    "Who’s most likely to stage a rose scavenger hunt around Hertford on your first date?",
    "Who’s most likely to ask you to stop sending voice note videos?",
    "Who’s most likely to DM a footballer “great game today mate”?",
    "Who’s most likely to start a podcast no one asked for?",
    "Who’s most likely to “live” in a dilapidated converted mechanics pit?",
    "Who’s most likely to send an unsolicited pic?",
    "Who says “all wine tastes the same”?",
    "Who’s most likely to have a secret subscription to Bonnie Blue’s OnlyFans?"
  ];
  
  const question = questions[currentQIndex];
  let selectedBachelor = null;

  app.innerHTML = `
    <div class="screen" style="max-height: none; padding: 20px 0;">
      <div class="glass-card" style="padding: 1.5rem;">
        <p style="color: var(--primary-pink); font-weight: 600; font-size: 0.9rem;">QUESTION ${currentQIndex + 1} OF 10</p>
        <h2 style="margin: 10px 0 20px 0; font-size: 1.4rem;">${question}</h2>
        
        <div class="tile-grid">
          ${state.bachelors.map(b => `<div class="name-tile" data-name="${b}">${b}</div>`).join('')}
        </div>
        
        <button id="submitVote" disabled>Select an answer</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.name-tile').forEach(tile => {
    tile.onclick = () => {
      document.querySelectorAll('.name-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      selectedBachelor = tile.getAttribute('data-name');
      
      const subBtn = document.querySelector('#submitVote');
      subBtn.disabled = false;
      subBtn.textContent = 'Submit vote';
    };
  });

  document.querySelector('#submitVote').onclick = async () => {
    const subBtn = document.querySelector('#submitVote');
    subBtn.disabled = true;
    subBtn.innerHTML = '<div class="loader-dots inline-loader" style="margin: 0 auto; transform: scale(0.6); display: flex; justify-content: center; align-items: center; gap: 5px;"><span></span><span></span><span></span></div>';

    const res = await api.submitVote(state.playerId, state.deviceToken, currentQIndex + 1, selectedBachelor);
    
    if (res.status === 'SUCCESS') {
      state.answeredCount++;
      render();
    } else {
      alert('Failed to submit vote. Try again.');
      subBtn.disabled = false;
      subBtn.textContent = 'Submit vote';
    }
  };
}

// --- Boot ---
init();
