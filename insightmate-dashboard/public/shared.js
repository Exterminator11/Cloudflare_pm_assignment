const API_BASE = 'https://insight-api.rachit1031.workers.dev';

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
async function fetchDiscordAnalysis() { return fetchAPI('/api/discord/analysis'); }
async function fetchEmailAnalysis() { return fetchAPI('/api/email/analysis'); }
async function fetchEmailSimilar(emailId) { return fetchAPI(`/api/email/similar/${emailId}`); }
async function fetchGithubAnalysis() { return fetchAPI('/api/github/analysis'); }
async function fetchGithub() { return fetchAPI('/api/github'); }
async function fetchEmail() { return fetchAPI('/api/email'); }
async function fetchTwitter() { return fetchAPI('/api/twitter'); }
async function fetchTwitterSentiment(days = 30) { return fetchAPI(`/api/twitter/analysis?days=${days}`); }
async function fetchTwitterSentimentOverTime(period = 'daily') { return fetchAPI(`/api/twitter/sentiment-over-time?period=${period}`); }
async function fetchTwitterFeatures(days = 90) { return fetchAPI(`/api/twitter/features?days=${days}`); }
async function fetchTwitterOverallSentiment() { return fetchAPI('/api/twitter/overall-sentiment'); }
async function fetchForum() { return fetchAPI('/api/forum'); }
async function fetchForumAnalysis() { return fetchAPI('/api/forum/analysis'); }
async function fetchInsights() { return fetchAPI('/api/insights'); }
async function fetchTicketAnalysis() { return fetchAPI('/api/tickets/analysis'); }

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

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
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
