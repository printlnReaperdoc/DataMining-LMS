const state = { csrfToken: null, user: null, course: null, authMode: 'login' };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.csrfToken) headers['x-csrf-token'] = state.csrfToken;
  const response = await fetch(`/api${url}`, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function showMessage(message) { $('#auth-message').textContent = message; }
function renderCurriculum() {
  $('#curriculum').innerHTML = state.course.modules.map((module) => `<div class="module"><h3>Module ${module.number} · ${escapeHtml(module.title)}</h3>${module.chapters.map((chapter) => `<button class="chapter-link ${chapter.status}" data-chapter="${chapter.id}" ${chapter.status === 'locked' ? 'disabled' : ''}><small>Chapter ${chapter.number} · ${chapter.status}</small>${escapeHtml(chapter.title)}</button>`).join('')}</div>`).join('');
  document.querySelectorAll('[data-chapter]').forEach((button) => button.addEventListener('click', () => loadChapter(button.dataset.chapter)));
}
async function loadChapter(id) {
  const { chapter } = await api(`/chapters/${id}`);
  $('#content').innerHTML = `<p class="eyebrow">Module: ${escapeHtml(chapter.moduleTitle)}</p><h2>Chapter ${chapter.chapter_number}: ${escapeHtml(chapter.title)}</h2><p class="muted">${escapeHtml(chapter.overview)}</p><h3>Learning objectives</h3><ul class="objective">${chapter.objectives.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><h3>Lesson</h3><div class="lesson">${escapeHtml(chapter.content)}</div><div class="chapter-actions">${chapter.quizId ? `<button class="primary" data-quiz="${chapter.id}">Take 10-minute quiz</button>` : '<span class="status">Quiz being prepared</span>'}</div>`;
  const quizButton = $('[data-quiz]');
  if (quizButton) quizButton.addEventListener('click', () => loadQuiz(id));
}
async function loadQuiz(chapterId) {
  const { quizId, questions, timeLimitSeconds } = await api(`/chapters/${chapterId}/quiz`);
  const startedAt = new Date().toISOString();
  let remaining = timeLimitSeconds;
  $('#content').innerHTML = `<p class="eyebrow">Assessment · 10 minutes</p><h2>Chapter quiz</h2><p class="muted" id="timer">10:00 remaining</p><form id="quiz-form">${questions.map((question) => `<fieldset><legend><strong>${question.questionNumber}. ${escapeHtml(question.prompt)}</strong></legend>${question.options.map((option, index) => `<label class="quiz-option"><input required type="radio" name="q-${question.id}" value="${index}">${escapeHtml(option)}</label>`).join('')}</fieldset>`).join('')}<button class="primary" type="submit">Submit quiz</button><p id="quiz-message" class="message"></p></form>`;
  const timer = setInterval(() => { remaining -= 1; $('#timer').textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} remaining`; if (remaining <= 0) { clearInterval(timer); $('#quiz-form').requestSubmit(); } }, 1000);
  $('#quiz-form').addEventListener('submit', async (event) => {
    event.preventDefault(); clearInterval(timer);
    const answers = questions.map((question) => ({ questionId: question.id, selectedOption: Number(new FormData(event.target).get(`q-${question.id}`)) }));
    try { const result = await api(`/quizzes/${quizId}/attempts`, { method: 'POST', body: JSON.stringify({ startedAt, answers }) }); $('#content').innerHTML = `<p class="eyebrow">Assessment complete</p><h2>${result.passed ? 'Chapter passed' : 'Keep practicing'}</h2><p class="score">${result.score}/20</p><p>${result.passed ? 'The next chapter is now unlocked.' : 'You need at least 15 correct answers. You may retake this quiz.'}</p>`; state.course = (await api('/course')).course; renderCurriculum(); } catch (error) { $('#quiz-message').textContent = error.message; }
  });
}
async function loadDashboard() {
  const data = await api('/auth/me'); state.user = data.user; state.csrfToken = data.csrfToken;
  state.course = (await api('/course')).course; $('#auth-view').hidden = true; $('#dashboard-view').hidden = false; $('#account').innerHTML = `<span>${escapeHtml(state.user.firstName)} · ${state.user.role}</span> <button id="logout">Log out</button>`; $('#logout').addEventListener('click', async () => { await api('/auth/logout', { method: 'POST' }); location.reload(); }); renderCurriculum(); const first = state.course.modules.flatMap((module) => module.chapters).find((chapter) => chapter.status !== 'locked'); if (first) loadChapter(first.id);
}
document.querySelectorAll('[data-auth]').forEach((tab) => tab.addEventListener('click', () => { state.authMode = tab.dataset.auth; document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab)); $('#registration-fields').hidden = state.authMode !== 'register'; $('#auth-form button[type=submit]').textContent = state.authMode === 'register' ? 'Create account' : 'Sign in'; }));
$('#auth-form').addEventListener('submit', async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.target)); try { if (state.authMode === 'register') { await api('/auth/register', { method: 'POST', body: JSON.stringify(values) }); state.authMode = 'login'; showMessage('Account created. You can now sign in.'); return; } const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(values) }); state.user = data.user; state.csrfToken = data.csrfToken; await loadDashboard(); } catch (error) { showMessage(error.message); } });
(async () => {
  try {
    const csrf = await api('/auth/csrf');
    state.csrfToken = csrf.csrfToken;
    await loadDashboard();
  } catch (error) {
    // An unauthenticated visitor stays on the sign-in screen.
  }
})();
