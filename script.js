/* ===================================================
   Hen Party Game — Game Logic
   ===================================================
   How to connect to Google Sheets:
   1. Deploy your Apps Script (apps-script/Code.gs) as a
      Web App (Execute as: Me, Who has access: Anyone).
   2. Copy the deployment URL and set it below.
   =================================================== */

const APPS_SCRIPT_URL = ''; // ← Paste your deployed Apps Script web-app URL here

/* --------------------------------------------------
   Game data
-------------------------------------------------- */

/**
 * 12 men that players vote on.
 * Replace `image` with real photo URLs once you have them.
 * The `emoji` is used as a fallback when the image cannot load.
 */
const MEN = [
  { id: 1,  name: 'Alex',   emoji: '🧑', image: '' },
  { id: 2,  name: 'Ben',    emoji: '👨', image: '' },
  { id: 3,  name: 'Carlos', emoji: '🧔', image: '' },
  { id: 4,  name: 'David',  emoji: '👱', image: '' },
  { id: 5,  name: 'Ethan',  emoji: '🧑‍🦱', image: '' },
  { id: 6,  name: 'Finn',   emoji: '👨‍🦰', image: '' },
  { id: 7,  name: 'George', emoji: '🧑‍🦲', image: '' },
  { id: 8,  name: 'Harry',  emoji: '👨‍🦳', image: '' },
  { id: 9,  name: 'Ivan',   emoji: '🧔‍♂️', image: '' },
  { id: 10, name: 'Jake',   emoji: '👦', image: '' },
  { id: 11, name: 'Liam',   emoji: '🧑‍🦱', image: '' },
  { id: 12, name: 'Max',    emoji: '👨‍🦲', image: '' },
];

/** 10 questions players answer by picking one of the 12 men. */
const QUESTIONS = [
  'Who would make the best wedding date?',
  'Who looks most likely to remember your anniversary?',
  'Who would send you flowers just because?',
  'Who would be the best dance partner at the reception?',
  'Who would you trust most with a secret?',
  'Who looks like the best cook?',
  'Who would be the most fun on a road trip?',
  'Who would you want to rescue you from a bad date?',
  'Who gives the best hugs?',
  'Who would you most want to see at a hen party?',
];

/* --------------------------------------------------
   State
-------------------------------------------------- */
let currentQuestion = 0;    // 0-based index into QUESTIONS
let votes = [];             // votes[i] = man id voted on question i
let playerName = '';

/* --------------------------------------------------
   DOM helpers
-------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* --------------------------------------------------
   Welcome screen
-------------------------------------------------- */
$('btn-start').addEventListener('click', () => {
  playerName = $('player-name').value.trim();
  startGame();
});

$('player-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('btn-start').click();
});

/* --------------------------------------------------
   Game logic
-------------------------------------------------- */
function startGame() {
  currentQuestion = 0;
  votes = [];
  showScreen('screen-question');
  renderQuestion();
}

function renderQuestion() {
  const total = QUESTIONS.length;

  // Progress bar & counter
  const pct = ((currentQuestion + 1) / total) * 100;
  $('progress-bar').style.width = pct + '%';
  $('q-counter').textContent = `Question ${currentQuestion + 1} of ${total}`;
  $('q-text').textContent = QUESTIONS[currentQuestion];

  // Re-enable the Next button guard
  $('btn-next').disabled = true;

  // Build man cards
  const grid = $('men-grid');
  grid.innerHTML = '';

  MEN.forEach((man) => {
    const card = document.createElement('div');
    card.className = 'man-card';
    card.dataset.id = man.id;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', man.name);
    card.setAttribute('tabindex', '0');

    if (man.image) {
      // Real photo
      const img = document.createElement('img');
      img.src = man.image;
      img.alt = man.name;
      img.loading = 'lazy';
      img.onerror = () => {
        // Swap to emoji fallback if image fails to load
        const placeholder = createAvatarPlaceholder(man.emoji, man.name);
        img.replaceWith(placeholder);
      };
      card.appendChild(img);
    } else {
      // Emoji fallback
      card.appendChild(createAvatarPlaceholder(man.emoji, man.name));
    }

    const nameEl = document.createElement('p');
    nameEl.className = 'card-name';
    nameEl.textContent = man.name;
    card.appendChild(nameEl);

    card.addEventListener('click', () => selectMan(card, man.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMan(card, man.id);
      }
    });

    grid.appendChild(card);
  });
}

function createAvatarPlaceholder(emoji, label) {
  const div = document.createElement('div');
  div.className = 'avatar-placeholder';
  if (label) div.setAttribute('aria-label', label);
  // Assign a soft pastel background colour based on the emoji for variety
  const colours = [
    '#fce4ec', '#f3e5f5', '#e3f2fd', '#e8f5e9',
    '#fff3e0', '#fbe9e7', '#e0f7fa', '#f9fbe7',
  ];
  div.style.background = colours[emoji.codePointAt(0) % colours.length];
  div.textContent = emoji;
  return div;
}

function selectMan(cardEl, manId) {
  // Deselect previously selected card
  $('men-grid').querySelectorAll('.man-card').forEach((c) => c.classList.remove('selected'));

  cardEl.classList.add('selected');
  votes[currentQuestion] = manId;
  $('btn-next').disabled = false;
}

$('btn-next').addEventListener('click', () => {
  if (votes[currentQuestion] === undefined) return;

  currentQuestion++;

  if (currentQuestion < QUESTIONS.length) {
    renderQuestion();
  } else {
    showResults();
  }
});

/* --------------------------------------------------
   Results
-------------------------------------------------- */
function showResults() {
  // Tally votes per man (id → count)
  const tally = {};
  MEN.forEach((m) => (tally[m.id] = 0));
  votes.forEach((id) => {
    if (id !== undefined) tally[id]++;
  });

  // Sort men: fewest votes first
  const sorted = [...MEN].sort((a, b) => tally[a.id] - tally[b.id]);
  const winner = sorted[0];              // fewest votes
  const loser  = sorted[sorted.length - 1]; // most votes

  // Podium
  renderPodiumCard('winner', winner, tally[winner.id]);
  renderPodiumCard('loser',  loser,  tally[loser.id]);

  // Full leaderboard (fewest → most)
  const list = $('leaderboard-list');
  list.innerHTML = '';
  const maxVotes = Math.max(...Object.values(tally), 1);

  sorted.forEach((man, idx) => {
    const count = tally[man.id];
    const barPct = Math.round((count / maxVotes) * 100);

    const li = document.createElement('li');

    const rank = document.createElement('span');
    rank.className = 'lb-rank';
    rank.textContent = `${idx + 1}.`;

    const name = document.createElement('span');
    name.className = 'lb-name';
    name.textContent = man.name;

    const barWrap = document.createElement('span');
    barWrap.className = 'lb-bar-wrap';
    const bar = document.createElement('span');
    bar.className = 'lb-bar';
    bar.style.width = barPct + '%';
    barWrap.appendChild(bar);

    const votesSpan = document.createElement('span');
    votesSpan.className = 'lb-votes';
    votesSpan.textContent = count;

    li.append(rank, name, barWrap, votesSpan);
    list.appendChild(li);
  });

  showScreen('screen-results');
  submitResults(tally);
}

function renderPodiumCard(type, man, count) {
  const imgEl  = $(`${type}-img`);
  const nameEl = $(`${type}-name`);
  const votesEl = $(`${type}-votes`);

  if (man.image) {
    imgEl.src  = man.image;
    imgEl.alt  = man.name;
    imgEl.style.display = 'block';
  } else {
    // Replace <img> with an emoji placeholder div
    const placeholder = document.createElement('div');
    placeholder.className = 'podium-avatar';
    placeholder.setAttribute('aria-label', man.name);

    const colours = [
      '#fce4ec', '#f3e5f5', '#e3f2fd', '#e8f5e9',
      '#fff3e0', '#fbe9e7', '#e0f7fa', '#f9fbe7',
    ];
    placeholder.style.background = colours[man.emoji.codePointAt(0) % colours.length];
    placeholder.textContent = man.emoji;
    imgEl.replaceWith(placeholder);
  }

  nameEl.textContent  = man.name;
  votesEl.textContent = `${count} vote${count !== 1 ? 's' : ''}`;
}

/* --------------------------------------------------
   Google Sheets submission (via Apps Script)
-------------------------------------------------- */
async function submitResults(tally) {
  if (!APPS_SCRIPT_URL) return; // No URL configured — skip silently

  const statusEl = $('submit-status');
  statusEl.textContent = 'Saving results…';
  statusEl.className = 'submit-status';

  const payload = {
    playerName: playerName || 'Anonymous',
    timestamp:  new Date().toISOString(),
    votes: votes.map((id, idx) => ({
      question: QUESTIONS[idx],
      manId:    id,
      manName:  MEN.find((m) => m.id === id)?.name ?? '',
    })),
    tally: MEN.map((m) => ({ id: m.id, name: m.name, votes: tally[m.id] })),
  };

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    statusEl.textContent = '✅ Results saved!';
    statusEl.className = 'submit-status success';
  } catch (err) {
    console.error('Could not submit results:', err);
    statusEl.textContent = '⚠️ Could not save results (offline or misconfigured).';
    statusEl.className = 'submit-status error';
  }
}

/* --------------------------------------------------
   Play again
-------------------------------------------------- */
$('btn-play-again').addEventListener('click', () => {
  // Reset state
  currentQuestion = 0;
  votes = [];
  $('player-name').value = '';
  $('submit-status').textContent = '';
  $('submit-status').className = 'submit-status';

  // Re-create the podium img elements in case they were replaced with placeholders
  resetPodiumImages();

  showScreen('screen-welcome');
});

function resetPodiumImages() {
  ['winner', 'loser'].forEach((type) => {
    const placeholder = document.querySelector(`#screen-results .podium-${type} .podium-avatar`);
    if (placeholder) {
      const img = document.createElement('img');
      img.id    = `${type}-img`;
      img.src   = '';
      img.alt   = type === 'winner' ? 'Winner' : 'Loser';
      img.className = 'podium-img';
      placeholder.replaceWith(img);
    }
  });
}

/* --------------------------------------------------
   Utility
-------------------------------------------------- */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
