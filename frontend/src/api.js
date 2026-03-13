const API_URL = 'https://script.google.com/macros/s/AKfycbxLb0dF_CSTtDwFRV4RW90Yht--MSeeJX6xLeqHmTtI2rrF8lQUNseVi7Fcsb7G246lFg/exec';

export async function sync(playerId, token) {
  const url = `${API_URL}?action=sync&playerId=${playerId || ''}&token=${token || ''}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('API error status:', resp.status);
      const text = await resp.text();
      console.error('API response body:', text);
      return { state: 'OFFLINE' };
    }
    return await resp.json();
  } catch (err) {
    console.error('Sync failed:', err);
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
