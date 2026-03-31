const fetch = require('node-fetch');

const API_URL = 'https://script.google.com/macros/s/AKfycbzpC0AsqW1oJKu4rJT3MaG6mgEBMBxsr67Dhc9UkCLfRS3g7xqL2suOM5iX-X54cw-g/exec';
const HOST_CODE = 'HEN2026';

async function readLogs() {
  console.log('--- Reading Backend Logs ---');
  // I need to use an admin action that returns logs if I had one? 
  // No, I don't have a direct log action.
  // But wait, getAdminStatus returns all registered names.
  
  const adminResp = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'adminControl', hostCode: HOST_CODE, adminAction: 'getAdminStatus' })
  });
  const adminData = await adminResp.json();
  console.log('Registered State (detailed):', JSON.stringify(adminData.players, null, 2));
}

readLogs();
