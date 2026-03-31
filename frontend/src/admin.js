import './style.css';
import * as api from './api';

const app = document.querySelector('#app');
let hostCode = localStorage.getItem('hens_host_code') || '';

export async function render() {
  if (!hostCode) {
    renderAuth();
  } else {
    await renderDashboard();
  }
}

function renderAuth() {
  if (!app) return;
  app.innerHTML = `
    <div class="screen">
      <div class="glass-card">
        <h1>Host Login</h1>
        <p>Enter the host code to manage the game.</p>
        <input type="password" id="hostCodeInput" placeholder="Host code...">
        <button id="loginBtn">Login</button>
      </div>
    </div>
  `;
  document.querySelector('#loginBtn').onclick = () => {
    hostCode = document.querySelector('#hostCodeInput').value;
    localStorage.setItem('hens_host_code', hostCode);
    render();
  };
}

async function renderDashboard() {
  if (!app) return;
  const data = await api.adminControl({ hostCode, adminAction: 'getAdminStatus' });

  if (data.status === 'error') {
    alert('Invalid host code');
    localStorage.removeItem('hens_host_code');
    hostCode = '';
    render();
    return;
  }

  const s = data.state;
  const joinedCount = data.players.filter(p => p.joined).length;
  const finishedCount = data.players.filter(p => p.completed).length;

  app.innerHTML = `
    <div class="screen" style="max-height: none; overflow-y: auto; padding: 40px 20px;">
      <div class="glass-card" style="max-width: 600px; padding: 3rem 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
          <h1 style="margin: 0; font-size: 1.5rem;">Host Command</h1>
          <button id="logoutBtn" class="ghost-btn" style="padding: 10px 16px;">EXIT</button>
        </div>

        <div style="background: rgba(0,0,0,0.2); padding: 24px; border-radius: 2rem; margin-bottom: 40px; border: 1px solid rgba(239, 240, 233, 0.05);">
           <div style="display: flex; justify-content: space-around; text-align: center;">
             <div>
               <div style="font-family: 'Newsreader', serif; font-size: 3.5rem; font-weight: 300; color: var(--primary); font-style: italic;">${joinedCount}</div>
               <div class="label-pill">Joined</div>
             </div>
             <div>
               <div style="font-family: 'Newsreader', serif; font-size: 3.5rem; font-weight: 300; color: var(--secondary); font-style: italic;">${finishedCount}</div>
               <div class="label-pill">Finished</div>
             </div>
           </div>
        </div>
        
        <div style="text-align: left; margin-bottom: 16px;">
          <div class="label-pill" style="opacity: 0.5;">Game Progression</div>
        </div>

        <div style="background: rgba(239, 240, 233, 0.04); border: 1px solid rgba(239, 240, 233, 0.08); border-radius: var(--radius-card); padding: 32px; margin-bottom: 24px; text-align: left;">
          <div class="label-pill" style="margin-bottom: 12px; color: var(--primary);">Current Phase</div>
          <h2 style="font-size: 3rem; margin: 0; color: var(--text-main); font-weight: 300; font-family: 'Newsreader', serif; font-style: italic;">${s}</h2>
          <div style="margin-top: 16px; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
             👁 Player View: ${s === 'JOINING' ? 'Registration Lobby' : (s === 'VOTING' ? 'Question Grid' : 'Results Leaderboard')}
          </div>
        </div>

        <div class="admin-actions" style="margin-bottom: 40px;">
          ${s === 'JOINING' ? `
            <button id="startVoting" class="admin-btn active" style="padding: 24px; text-align: center; border: none; background: linear-gradient(135deg, var(--primary), var(--primary-container)); color: var(--on-primary);">
               <div style="width: 100%;">
                 <div class="btn-title" style="font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.2rem; font-family: 'Manrope', sans-serif;">start voting phase &rarr;</div>
               </div>
            </button>
          ` : ''}
          ${s === 'VOTING' ? `
            <button id="showResults" class="admin-btn active" style="padding: 24px; text-align: center; border: none; background: linear-gradient(135deg, var(--primary), var(--primary-container)); color: var(--on-primary);">
               <div style="width: 100%;">
                 <div class="btn-title" style="font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.2rem; font-family: 'Manrope', sans-serif;">reveal final results &rarr;</div>
               </div>
            </button>
            <button id="startJoining" class="ghost-btn" style="margin-top: 16px; width: 100%; border: none;">Reset Lobby</button>
          ` : ''}

          ${s === 'RESULTS' ? `
            <div style="text-align: center; padding: 32px; border: 1px solid var(--primary); border-radius: 2rem;">
               <p style="font-weight: 900; font-size: 1.2rem; color: var(--primary);">GAME COMPLETE</p>
               <button id="startVoting" class="ghost-btn" style="margin-top: 16px;">Back to Voting</button>
               <button id="startJoining" class="ghost-btn" style="margin-top: 12px;">Reset Lobby</button>
            </div>
          ` : ''}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 1.1rem; opacity: 0.7;">Joined Guests</h3>
        </div>

        <div class="player-roster">
          ${data.players.map(p => `
            <div class="player-card" style="padding: 12px 20px;">
              <div class="player-info">
                <span class="player-name" style="font-size: 1.1rem; font-weight: 700;">${p.name}</span>
                <span class="player-status" style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">
                  ● CONNECTED ${p.completed ? '• <span style="color: var(--secondary)">VOTED</span>' : ''}
                </span>
              </div>
            </div>
          `).join('') || '<p style="opacity: 0.4; padding: 24px; text-align: center; font-size: 0.8rem;">No guests are currently connected.</p>'}
        </div>
      </div>
    </div>
  `;

  document.querySelector('#logoutBtn').onclick = () => {
    localStorage.removeItem('hens_host_code');
    hostCode = '';
    render();
  };

  document.querySelector('#startJoining')?.addEventListener('click', () => updateState('JOINING', 'startJoining'));
  document.querySelector('#startVoting')?.addEventListener('click', () => updateState('VOTING', 'startVoting'));
  document.querySelector('#showResults')?.addEventListener('click', () => updateState('RESULTS', 'showResults'));
}

async function updateState(newState, btnId) {
  const btn = document.getElementById(btnId);
  const originalContent = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<div class="loader-dots inline-loader"><span></span><span></span><span></span></div>';

  try {
    const res = await api.adminControl({ hostCode, newState });
    if (res.status === 'SUCCESS') {
      await render(); 
    } else {
      btn.disabled = false;
      btn.innerHTML = originalContent;
      alert('Action failed: ' + (res.message || 'Unknown error.'));
    }
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Network error.');
  }
}
