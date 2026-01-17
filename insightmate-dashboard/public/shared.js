const API_BASE = 'http://localhost:8789';

async function fetchAPI(endpoint) {
  try {
    console.log(`${API_BASE}${endpoint}`)
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function fetchTickets() { return fetchAPI('/api/tickets'); }
async function fetchDiscord() { return fetchAPI('/api/discord'); }
async function fetchGithub() { return fetchAPI('/api/github'); }
async function fetchEmail() { return fetchAPI('/api/email'); }
async function fetchTwitter() { return fetchAPI('/api/twitter'); }
async function fetchForum() { return fetchAPI('/api/forum'); }
async function fetchInsights() { return fetchAPI('/api/insights'); }

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

function showLoading(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideLoading(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

function getColor(source) {
  const colors = {
    tickets: 'blue',
    discord: 'indigo',
    github: 'purple',
    email: 'red',
    twitter: 'blue-500',
    forum: 'green'
  };
  return colors[source] || 'gray';
}
