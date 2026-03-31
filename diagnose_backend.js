const fetch = require('node-fetch');

const API_URL = 'https://script.google.com/macros/s/AKfycbzpC0AsqW1oJKu4rJT3MaG6mgEBMBxsr67Dhc9UkCLfRS3g7xqL2suOM5iX-X54cw-g/exec';
const HOST_CODE = 'HEN2026';

async function diagnose() {
  console.log('--- GETting current status ---');
  const syncResp = await fetch(API_URL + '?action=sync');
  const syncData = await syncResp.json();
  console.log('Current State:', syncData.state);
  console.log('Player Names seen by sync:', syncData.allPlayers);

  console.log('\n--- GETting full status via AdminControl ---');
  const adminResp = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'adminControl', hostCode: HOST_CODE, adminAction: 'getAdminStatus' })
  });
  const adminData = await adminResp.json();
  console.log('Admin Player Detail:', adminData.players);
}

diagnose();
