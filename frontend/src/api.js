// The backend API URL. 
// For cloning/templates: Set this via your hosting provider's environment variables.
const API_URL = 'https://script.google.com/macros/s/AKfycbzpC0AsqW1oJKu4rJT3MaG6mgEBMBxsr67Dhc9UkCLfRS3g7xqL2suOM5iX-X54cw-g/exec';


export async function sync(playerId, token) {
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'sync', playerId: playerId || '', token: token || '' })
    });
    if (!resp.ok) return { state: 'OFFLINE' };
    return await resp.json();
  } catch (err) {
    return { state: 'OFFLINE' };
  }
}

export async function joinPlayer(name, deviceToken) {
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'join', name, deviceToken })
    });
    return await resp.json();
  } catch (err) {
    console.error('Join failed:', err);
    return { status: 'error', message: 'Connection error' };
  }
}

export async function submitVote(playerId, token, questionId, selection) {
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'vote', playerId, token, questionId, selection })
    });
    return await resp.json();
  } catch (err) {
    console.error('Vote failed:', err);
    return { status: 'error', message: 'Connection error' };
  }
}

export async function adminControl(body) {
  try {
    console.log('Sending Admin Control Body:', body);
    const resp = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'adminControl', ...body })
    });
    return await resp.json();
  } catch (err) {
    console.error('Admin control failed:', err);
    return { status: 'error', message: 'Connection error' };
  }
}
