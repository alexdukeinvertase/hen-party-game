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
            </div>
          ` : ''}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 1.1rem; opacity: 0.7;">Joined Guests</h3>
          <button id="refreshBtn" class="ghost-btn" style="padding: 6px 16px; font-size: 0.7rem;">REFRESH</button>
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
              <div class="player-actions">
                <button class="reset-btn" data-name="${p.name}" style="background: transparent; border-color: rgba(255, 0, 0, 0.2); font-size: 0.65rem; color: #ff9999; padding: 6px 16px;">REMOVE</button>
              </div>
            </div>
          `).join('') || '<p style="opacity: 0.4; padding: 24px; text-align: center; font-size: 0.8rem;">No guests are currently connected.</p>'}
        </div>

        <div style="margin-top: 64px; padding-top: 32px; border-top: 1px dashed rgba(239, 240, 233, 0.1);">
           <div class="label-pill" style="color: #ff5555; opacity: 0.8; margin-bottom: 12px;">Danger Zone</div>
           <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 16px;">Irreversibly delete all player data and votes to start a fresh game.</p>
           <button id="fullResetBtn" style="background: rgba(255, 0, 0, 0.15); border: 1px solid rgba(255, 0, 0, 0.3); color: #ff9999; font-size: 0.8rem; padding: 16px;">WIPE ALL DATA & RESET GAME</button>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#logoutBtn').onclick = () => {
    localStorage.removeItem('hens_host_code');
    hostCode = '';
    render();
  };

  // Use optional chaining to avoid "null" errors when buttons are hidden in certain phases
  document.querySelector('#startJoining')?.addEventListener('click', () => updateState('JOINING', 'startJoining'));
  document.querySelector('#startVoting')?.addEventListener('click', () => updateState('VOTING', 'startVoting'));
  document.querySelector('#showResults')?.addEventListener('click', () => updateState('RESULTS', 'showResults'));
  document.querySelector('#refreshBtn')?.addEventListener('click', () => render());

  document.querySelector('#fullResetBtn')?.addEventListener('click', async () => {
    if (!confirm('🚨 CAUTION 🚨\n\nThis will completely delete ALL players and ALL votes from the database.\n\nThis action cannot be undone. Are you absolutely sure?')) return;
    
    const btn = document.querySelector('#fullResetBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'WIPING DATABASE...';
    }
    
    try {
      const res = await api.adminControl({ hostCode, adminAction: 'fullReset' });
      if (res.status === 'SUCCESS') {
        render();
      } else {
        alert('Failed to reset: ' + (res.message || 'Unknown error'));
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'WIPE ALL DATA & RESET GAME';
        }
      }
    } catch (e) {
      alert('Network error during reset.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'WIPE ALL DATA & RESET GAME';
      }
    }
  });

  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.onclick = async () => {
      const name = btn.getAttribute('data-name');
      if (!name) return;

      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';
      
      try {
        console.log(`Attempting to remove player: ${name}`);
        const res = await api.adminControl({ hostCode, adminAction: 'resetName', targetPlayer: name });
        console.log('Remove response:', res);

        if (res.status === 'SUCCESS') {
          await render();
        } else {
          btn.disabled = false;
          btn.textContent = originalText;
          alert('Failed to remove: ' + (res.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Remove Error:', err);
        btn.disabled = false;
        btn.textContent = originalText;
        alert('Network error. Check your connection or host PIN.');
      }
    };
  });
}

async function updateState(newState, btnId) {
  const btn = document.getElementById(btnId);
  const originalContent = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<div class="loader-dots inline-loader"><span></span><span></span><span></span></div>';

  try {
    console.log(`Setting Game State to: ${newState}`);
    const res = await api.adminControl({ hostCode, newState });
    console.log('Server response:', res);
    
    if (res.status === 'SUCCESS') {
      await render(); // Refresh full dashboard
    } else {
      btn.disabled = false;
      btn.innerHTML = originalContent;
      alert('Action failed: ' + (res.message || 'Unknown error. Check Google Sheet for logic errors.'));
    }
  } catch (e) {
    console.error('State Update Error:', e);
    btn.disabled = false;
    btn.innerHTML = originalContent;
    alert('Network error. Google Apps Script might be throttled or disconnected.');
  }
}
