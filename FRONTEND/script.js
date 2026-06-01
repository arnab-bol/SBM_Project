
// Use same-origin when the app is opened via the backend (http://localhost:5000)

const user =
  localStorage.getItem("mindspaceUser");

if (!user) {

  window.location.href =
    "login.html";

}

const userData =
  JSON.parse(user);


function logoutUser() {

  localStorage.removeItem(
    "mindspaceUser"
  );

  window.location.href =
    "login.html";

}



const API_URL =
  "http://localhost:3000/api";



// ---- STATE ----
let moodLogs = [];
let journalEntries = [];
let contacts = [];
let selectedMood = null;
let breathActive = false;
let breathTimer = null;
let breathInhale = 4, breathHold = 4, breathExhale = 4;
let currentQuoteIdx = 0;

const quotes = [
  { text: "You are stronger than you believe and braver than you think.", author: "A.A. Milne" },
  { text: "It's okay to not be okay. What matters is that you keep going.", author: "Unknown" },
  { text: "Your feelings are valid. Your struggles are real. And you deserve support.", author: "Unknown" },
  { text: "Healing is not linear. Be patient and kind to yourself.", author: "Unknown" },
  { text: "The darkest nights produce the brightest stars.", author: "John Green" },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or frustrated.", author: "Lori Deschene" },
  { text: "Self-care is not a luxury. It is a necessity.", author: "Audre Lorde" },
  { text: "One small crack does not mean that you are broken. It means you were put to the test and you didn't fall apart.", author: "Linda Poindexter" },
  { text: "Mental health needs a great deal of attention. It's the final taboo and it needs to be faced.", author: "Adam Ant" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Sharon Salzberg" },
];

const affirmations = [
  "I am worthy of love and belonging.",
  "I choose peace over worry.",
  "My feelings matter and so do I.",
  "I am capable of getting through this.",
  "I am doing the best I can.",
  "It is safe to ask for help.",
  "I deserve rest and care.",
  "This feeling will pass.",
];

// ---- API HELPERS ----
function mapMoodFromApi(m) {
  return {
    _id: m._id,
    label: m.mood,
    emoji: m.emoji,
    note: m.note || '',
    time: m.createdAt,
  };
}

function mapJournalFromApi(j) {
  return {
    _id: j._id,
    title: j.title,
    body: j.body,
    time: j.createdAt,
  };
}

function mapContactFromApi(c) {
  return {
    _id: c._id,
    name: c.name,
    phone: c.phone || '',
  };
}

async function loadMoods() {
  try {

    const res = await fetch(
      `${API_URL}/moods?userId=${userData.id}`
    );


    if (!res.ok) throw new Error('Failed to load moods');
    const data = await res.json();
    moodLogs = data.map(mapMoodFromApi);
    renderMoodLog();
    return true;
  } catch (err) {
    console.error(err);
    moodLogs = [];
    renderMoodLog();
    return false;
  }
}

async function loadJournals() {
  try {
    const res = await fetch(`${API_URL}/journals?userId=${userData.id}`);
    if (!res.ok) throw new Error('Failed to load journals');
    const data = await res.json();
    journalEntries = data.map(mapJournalFromApi);
    renderJournal();
    return true;
  } catch (err) {
    console.error(err);
    journalEntries = [];
    renderJournal();
    return false;
  }
}

async function loadContacts() {
  try {
    const res = await fetch(`${API_URL}/contacts?userId=${userData.id}`);
    if (!res.ok) throw new Error('Failed to load contacts');
    const data = await res.json();
    contacts = data.map(mapContactFromApi);
    renderContacts();
    return true;
  } catch (err) {
    console.error(err);
    contacts = [];
    renderContacts();
    return false;
  }
}

async function loadAllData() {
  const [moodsOk, journalsOk, contactsOk] = await Promise.all([
    loadMoods(),
    loadJournals(),
    loadContacts(),
  ]);
  if (!moodsOk && !journalsOk && !contactsOk) {
    showToast('Start the backend, then open http://localhost:5000');
  }
}

// ---- NAVIGATION ----
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  const tabs = document.querySelectorAll('.nav-tab');
  const idx = ['home', 'mood', 'journal', 'breathe', 'inspire', 'emergency'].indexOf(name);
  if (tabs[idx]) tabs[idx].classList.add('active');
  if (name === 'mood') renderMoodLog();
  if (name === 'journal') renderJournal();
  if (name === 'inspire') renderAffirmations();
  if (name === 'emergency') renderContacts();
}

// ---- GREETING ----
function setGreeting() {
  const h = new Date().getHours();
  let g = h < 12 ? 'Good morning 🌅' : h < 17 ? 'Good afternoon ☀️' : h < 20 ? 'Good evening 🌇' : 'Good night 🌙';

  document.getElementById(
    'greeting-text'
  ).textContent =
    `${g}, ${userData.name} 🌿`;


  document.getElementById('greeting-date').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- MOOD ----
function selectMood(btn, label, emoji) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedMood = { label, emoji };
}

async function logMood() {
  if (!selectedMood) { showToast('Please select a mood first!'); return; }
  const note = document.getElementById('mood-note-input').value.trim();

  try {
    const res = await fetch(`${API_URL}/moods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },


      body: JSON.stringify({

        userId: userData.id,

        userName: userData.name,

        userEmail: userData.email,

        mood: selectedMood.label,

        emoji: selectedMood.emoji,

        note,

      })



    });

    if (!res.ok) throw new Error('Failed to save mood');

    const saved = mapMoodFromApi(await res.json());
    moodLogs.unshift(saved);

    document.getElementById('mood-note-input').value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    selectedMood = null;
    renderMoodLog();
    showToast('Mood saved! 💚');
  } catch (err) {
    console.error(err);
    showToast('Could not save mood. Try again.');
  }
}

function renderMoodLog(filteredLogs = moodLogs) {

  const el =
    document.getElementById('mood-log-list');

  if (!filteredLogs.length) {

    el.innerHTML = `
      <p style="color:var(--muted);font-size:0.9rem;">
        No mood records found.
      </p>
    `;

    return;
  }

  el.innerHTML =
    filteredLogs.map((m) => `

      <div class="mood-log-item">

        <div class="log-left">

          <span class="log-emoji">
            ${m.emoji}
          </span>

          <div class="log-info">

            <div class="log-mood">
              ${m.label}
            </div>

            ${m.note
        ? `<div class="log-note">${m.note}</div>`
        : ''
      }

            <div class="log-date">
              ${formatFullDate(m.time)}
            </div>

          </div>

        </div>

        <div class="log-actions">

          <button
            class="edit-btn"
            onclick="editMood('${m._id}')"
          >
            ✏️
          </button>

          <button
            class="delete-btn"
            onclick="deleteMood('${m._id}')"
          >
            🗑️
          </button>

        </div>

      </div>

    `).join('');
}
// ---- DELETE MOOD ----

async function deleteMood(id) {

  const confirmDelete =
    confirm('Delete this mood log?');

  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_URL}/moods/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete mood');

    moodLogs = moodLogs.filter(m => m._id !== id);
    renderMoodLog();
    showToast('Mood deleted 🗑️');
  } catch (err) {
    console.error(err);
    showToast('Could not delete mood. Try again.');
  }
}

// ---- EDIT MOOD ----
async function editMood(id) {

  const mood = moodLogs.find(m => m._id === id);
  if (!mood) return;

  // ---- SELECT NEW MOOD ----

  const newMood = prompt(

    `Choose new mood:

1 = 😄 Happy
2 = 😌 Calm
3 = 😐 Okay
4 = 😰 Anxious
5 = 😢 Sad
6 = 😤 Stressed
7 = 😴 Tired
8 = 😠 Angry
9 = 🌟 Hopeful
10 = 🥺 Lonely

Current: ${mood.label}`

  );

  if (newMood === null) return;

  const moodMap = {

    1: { label: 'Happy', emoji: '😄' },
    2: { label: 'Calm', emoji: '😌' },
    3: { label: 'Okay', emoji: '😐' },
    4: { label: 'Anxious', emoji: '😰' },
    5: { label: 'Sad', emoji: '😢' },
    6: { label: 'Stressed', emoji: '😤' },
    7: { label: 'Tired', emoji: '😴' },
    8: { label: 'Angry', emoji: '😠' },
    9: { label: 'Hopeful', emoji: '🌟' },
    10: { label: 'Lonely', emoji: '🥺' }

  };

  if (!moodMap[newMood]) {

    showToast('Invalid mood selection');

    return;
  }

  // ---- NOTE ----

  const updatedNote = prompt(

    'Edit your note:',

    mood.note || ''

  );

  if (updatedNote === null) return;

  try {
    const res = await fetch(`${API_URL}/moods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: moodMap[newMood].label,
        emoji: moodMap[newMood].emoji,
        note: updatedNote,
      }),
    });

    if (!res.ok) throw new Error('Failed to update mood');

    const updated = mapMoodFromApi(await res.json());
    const idx = moodLogs.findIndex(m => m._id === id);
    if (idx !== -1) moodLogs[idx] = updated;

    renderMoodLog();
    showToast('Mood updated ✨');
  } catch (err) {
    console.error(err);
    showToast('Could not update mood. Try again.');
  }
}

// ---- FILTER BY DATE ----

function filterMoodByDate() {

  const selectedDate =
    document.getElementById(
      'mood-date-filter'
    ).value;

  if (!selectedDate) {

    renderMoodLog();

    return;
  }

  const filtered = moodLogs.filter(m => {

    const d = new Date(m.time);

    const moodDate =
      d.toLocaleDateString(
        'en-CA',
        {
          timeZone: 'Asia/Kolkata'
        }
      );

    return moodDate === selectedDate;
  });

  renderMoodLog(filtered);
}

// ---- CLEAR FILTER ----

function clearMoodFilter() {

  document.getElementById(
    'mood-date-filter'
  ).value = '';

  renderMoodLog();
}

// ---- DATE FORMAT ----

function formatFullDate(iso) {

  const d = new Date(iso);

  return d.toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}
// ---- JOURNAL ----
async function saveEntry() {
  const title = document.getElementById('journal-title').value.trim();
  const body = document.getElementById('journal-body').value.trim();
  if (!title && !body) { showToast('Write something first!'); return; }

  try {
    const res = await fetch(`${API_URL}/journals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },


      body: JSON.stringify({

        userId: userData.id,

        userName: userData.name,

        userEmail: userData.email,

        title,

        body

      })




    });

    if (!res.ok) throw new Error('Failed to save journal');

    const saved = mapJournalFromApi(await res.json());
    journalEntries.unshift(saved);

    document.getElementById('journal-title').value = '';
    document.getElementById('journal-body').value = '';
    renderJournal();
    showToast('Entry saved! 📓');
  } catch (err) {
    console.error(err);
    showToast('Could not save entry. Try again.');
  }
}

function renderJournal(filteredEntries = journalEntries) {

  const el =
    document.getElementById('journal-list');

  if (!filteredEntries.length) {

    el.innerHTML = `
      <p style="color:var(--muted);font-size:0.9rem;">
        No entries found.
      </p>
    `;

    return;
  }

  el.innerHTML = filteredEntries.map((e) => `

    <div class="journal-card">

      <h4>${e.title}</h4>

      <p>
        ${e.body.length > 180
      ? e.body.slice(0, 180) + '…'
      : e.body
    }
      </p>

      <div class="card-footer">

        <span class="card-date">
          ${formatFullDate(e.time)}
        </span>

        <div class="log-actions">

          <button
            class="edit-btn"
            onclick="editJournal('${e._id}')"
          >
            ✏️
          </button>

          <button
            class="delete-btn"
            onclick="deleteJournal('${e._id}')"
          >
            🗑️
          </button>

        </div>

      </div>

    </div>

  `).join('');
}
// ---- DELETE JOURNAL ----

async function deleteJournal(id) {

  const confirmDelete =
    confirm('Delete this journal entry?');

  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_URL}/journals/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete journal');

    journalEntries = journalEntries.filter(e => e._id !== id);
    renderJournal();
    showToast('Journal deleted 🗑️');
  } catch (err) {
    console.error(err);
    showToast('Could not delete journal. Try again.');
  }
}

// ---- EDIT JOURNAL ----

async function editJournal(id) {

  const entry = journalEntries.find(e => e._id === id);
  if (!entry) return;

  const updatedTitle = prompt(
    'Edit title:',
    entry.title
  );

  if (updatedTitle === null) return;

  const updatedBody = prompt(
    'Edit journal:',
    entry.body
  );

  if (updatedBody === null) return;

  try {
    const res = await fetch(`${API_URL}/journals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTitle,
        body: updatedBody,
      }),
    });

    if (!res.ok) throw new Error('Failed to update journal');

    const updated = mapJournalFromApi(await res.json());
    const idx = journalEntries.findIndex(e => e._id === id);
    if (idx !== -1) journalEntries[idx] = updated;

    renderJournal();
    showToast('Journal updated ✨');
  } catch (err) {
    console.error(err);
    showToast('Could not update journal. Try again.');
  }
}

// ---- FILTER JOURNAL ----

function filterJournalByDate() {

  const selectedDate =
    document.getElementById(
      'journal-date-filter'
    ).value;

  if (!selectedDate) {

    renderJournal();

    return;
  }

  const filtered =
    journalEntries.filter(entry => {

      const d = new Date(entry.time);

      const entryDate =
        d.toLocaleDateString(
          'en-CA',
          {
            timeZone: 'Asia/Kolkata'
          }
        );

      return entryDate === selectedDate;
    });

  renderJournal(filtered);
}

// ---- CLEAR JOURNAL FILTER ----

function clearJournalFilter() {

  document.getElementById(
    'journal-date-filter'
  ).value = '';

  renderJournal();
}


// ---- BREATHING ----
function setTechnique(el, i, h, e, name) {
  document.querySelectorAll('.technique-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  breathInhale = i; breathHold = h; breathExhale = e;
  document.getElementById('ph-inhale').textContent = i + 's';
  document.getElementById('ph-hold').textContent = h + 's';
  document.getElementById('ph-exhale').textContent = e + 's';
  if (breathActive) resetBreath();
}

function toggleBreath() {
  if (breathActive) { resetBreath(); return; }
  breathActive = true;
  document.getElementById('breath-start-btn').textContent = '⏸ Pause';
  document.getElementById('breath-circle').classList.add('animating');
  runBreathCycle();
}

function runBreathCycle() {
  if (!breathActive) return;
  const circle = document.getElementById('breath-circle');
  const label = document.getElementById('breath-phase-label');
  const sub = document.getElementById('breath-phase-sub');
  const total = (breathInhale + breathHold + breathExhale) * 1000;

  circle.style.animation = 'none';
  circle.offsetHeight;
  circle.style.animation = `breathe ${total / 1000}s ease-in-out infinite`;

  label.textContent = 'Inhale';
  sub.textContent = `${breathInhale} seconds`;
  setTimeout(() => {
    if (!breathActive) return;
    if (breathHold > 0) { label.textContent = 'Hold'; sub.textContent = `${breathHold} seconds`; }
  }, breathInhale * 1000);
  setTimeout(() => {
    if (!breathActive) return;
    label.textContent = 'Exhale'; sub.textContent = `${breathExhale} seconds`;
  }, (breathInhale + breathHold) * 1000);
  breathTimer = setTimeout(() => { if (breathActive) runBreathCycle(); }, total);
}

function resetBreath() {
  breathActive = false;
  clearTimeout(breathTimer);
  const circle = document.getElementById('breath-circle');
  circle.classList.remove('animating');
  circle.style.animation = '';
  document.getElementById('breath-phase-label').textContent = 'Ready';
  document.getElementById('breath-phase-sub').textContent = 'Press Start';
  document.getElementById('breath-start-btn').textContent = '▶ Start';
}

// ---- QUOTES ----
function newQuote() {
  currentQuoteIdx = (currentQuoteIdx + 1) % quotes.length;
  const q = quotes[currentQuoteIdx];
  const card = document.getElementById('quote-card');
  card.style.opacity = '0'; card.style.transform = 'scale(0.97)';
  setTimeout(() => {
    document.getElementById('quote-text').textContent = q.text;
    document.getElementById('quote-author').textContent = '— ' + q.author;
    card.style.transition = 'opacity 0.4s,transform 0.4s';
    card.style.opacity = '1'; card.style.transform = 'scale(1)';
  }, 300);
}

function renderAffirmations() {
  document.getElementById('affirmation-grid').innerHTML = affirmations.map(a =>
    `<div class="affirmation-card"><p>${a}</p></div>`).join('');
}

// ---- CONTACTS ----
async function addContact() {
  const name = document.getElementById('contact-name-input').value.trim();
  const phone = document.getElementById('contact-phone-input').value.trim();
  if (!name) { showToast('Please enter a name!'); return; }

  try {
    const res = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },


      body: JSON.stringify({

        userId: userData.id,

        userName: userData.name,

        userEmail: userData.email,

        name,

        phone

      })




    });

    if (!res.ok) throw new Error('Failed to add contact');

    const saved = mapContactFromApi(await res.json());
    contacts.push(saved);

    document.getElementById('contact-name-input').value = '';
    document.getElementById('contact-phone-input').value = '';
    renderContacts();
    showToast('Contact added! 💚');
  } catch (err) {
    console.error(err);
    showToast('Could not add contact. Try again.');
  }
}

async function deleteContact(id) {
  try {
    const res = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete contact');

    contacts = contacts.filter(c => c._id !== id);
    renderContacts();
  } catch (err) {
    console.error(err);
    showToast('Could not delete contact. Try again.');
  }
}

function renderContacts() {
  const el = document.getElementById('contact-list');
  if (!contacts.length) { el.innerHTML = '<p style="color:var(--muted);font-size:0.88rem;">Add people you trust — family, friends, or a counsellor.</p>'; return; }
  el.innerHTML = contacts.map((c) => `
    <div class="contact-item">
      <div class="contact-avatar">${c.name[0].toUpperCase()}</div>
      <div class="contact-name">${c.name}${c.phone ? ` · ${c.phone}` : ''}</div>
      ${c.phone ? `<a href="tel:${c.phone}" class="call-btn" style="margin-right:8px;">Call</a>` : ''}
      <button class="contact-delete" onclick="deleteContact('${c._id}')">✕</button>
    </div>`).join('');
}

// ---- UTILS ----
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ---- INIT ----
setGreeting();
renderAffirmations();
loadAllData();