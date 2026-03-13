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

  app.innerHTML = `
    <div class="screen" style="max-height: none; overflow-y: auto; padding: 40px 20px;">
      <div class="glass-card" style="max-width: 600px;">
        <h1>Admin Portal</h1>
        <p>Current State: <strong>${data.state}</strong></p>
        
        <div class="admin-controls" style="margin: 30px 0; display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="startJoining" style="flex: 1; min-width: 140px; background: #666;">Set Joining</button>
          <button id="startVoting" style="flex: 1; min-width: 140px; background: #28a745;">Start Voting</button>
          <button id="showResults" style="flex: 1; min-width: 140px; background: #ec135b;">Reveal Results</button>
        </div>

        <h3>Players (${data.players.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--soft-rose);">
              <th style="text-align: left; padding: 10px;">Name</th>
              <th style="padding: 10px;">Joined</th>
              <th style="padding: 10px;">Done</th>
              <th style="padding: 10px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${data.players.map(p => `
              <tr style="border-bottom: 1px solid var(--soft-rose);">
                <td style="padding: 10px;">${p.name}</td>
                <td style="text-align: center; padding: 10px;">${p.joined ? '✅' : '○'}</td>
                <td style="text-align: center; padding: 10px;">${p.completed ? '✅' : '○'}</td>
                <td style="padding: 10px;">
                  <button class="reset-btn" data-name="${p.name}" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 4px;">Reset</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <button id="refreshBtn" style="margin-top: 30px; background: transparent; border: 1px solid var(--primary-pink); color: var(--primary-pink);">Refresh Status</button>
      </div>
    </div>
  `;

  document.querySelector('#startJoining').onclick = () => updateState('JOINING');
  document.querySelector('#startVoting').onclick = () => updateState('VOTING');
  document.querySelector('#showResults').onclick = () => updateState('RESULTS');
  document.querySelector('#refreshBtn').onclick = () => render();
  
  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.onclick = async () => {
      const name = btn.getAttribute('data-name');
      await api.adminControl({ hostCode, adminAction: 'resetName', targetPlayer: name });
      render();
    };
  });
}

async function updateState(newState) {
  const res = await api.adminControl({ hostCode, newState });
  if (res.status === 'SUCCESS') render();
}
