/**
 * Data Mining LMS (ITEP411-T) Vanilla Frontend Controller
 * Implements Student and Faculty workflows, sequential unlocking, 20-question quiz engine,
 * interactive presentation carousel, gradebooks, exports, and audit logging.
 */

// Application State
const state = {
  user: null,
  csrfToken: null,
  course: null,
  modules: [],
  selectedChapterId: null,
  activeQuizAttempt: null,
  quizTimerInterval: null,
  activeSlideIndex: 0,
  slides: []
};

// DOM Selector Helper
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// HTML Escaper for XSS prevention
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

// Format date helper
function formatDate(isoStr) {
  if (!isoStr) return 'Never';
  const d = new Date(isoStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// REST API Helper
async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.csrfToken) {
    headers['x-csrf-token'] = state.csrfToken;
  }

  // Handle FormData uploads
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`/api${url}`, {
    ...options,
    headers,
    credentials: 'same-origin'
  });

  if (response.status === 204) return null;

  // Handle binary downloads (PDF, XLSX, CSV)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || contentType.includes('spreadsheetml') || contentType.includes('text/csv')) {
    if (!response.ok) throw new Error('Export download failed');
    const blob = await response.blob();
    return blob;
  }

  const data = await response.json();
  if (!response.ok) {
    let msg = data.error || 'Server request failed';
    if (data.details && Array.isArray(data.details) && data.details.length > 0) {
      const detailMsgs = data.details.map((d) => d.message).filter(Boolean);
      if (detailMsgs.length > 0) {
        msg = `${msg}: ${detailMsgs.join('. ')}`;
      }
    }
    const err = new Error(msg);
    err.details = data.details;
    throw err;
  }
  return data;
}

// Modal Dialog Utility
function openModal(title, htmlContent, actionsHtml = '', closeBtnText = 'Close') {
  const container = $('#modal-container');
  container.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
      <div class="modal-card">
        <div class="modal-header">
          <h3>${escapeHtml(title)}</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">${htmlContent}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">${escapeHtml(closeBtnText)}</button>
          ${actionsHtml}
        </div>
      </div>
    </div>
  `;
  container.style.display = 'block';
}

function closeModal() {
  const container = $('#modal-container');
  container.style.display = 'none';
  container.innerHTML = '';
}

// Trigger File Download
function triggerFileDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

/* ==========================================================================
   AUTHENTICATION & SESSION HANDLING
   ========================================================================== */

function setAuthAlert(msg, type = 'danger') {
  const alert = $('#auth-alert');
  if (!msg) {
    alert.style.display = 'none';
    alert.textContent = '';
    return;
  }
  alert.className = `alert-message alert-${type}`;
  alert.textContent = msg;
  alert.style.display = 'block';
}

// Setup Auth Tabs
$$('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    $('#login-form').style.display = isLogin ? 'block' : 'none';
    $('#register-form').style.display = isLogin ? 'none' : 'block';
    setAuthAlert(null);
  });
});

// Login Form Submit
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setAuthAlert(null);
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData);

  try {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    state.user = res.user;
    state.csrfToken = res.csrfToken;
    e.target.reset();
    await initDashboard();
  } catch (err) {
    setAuthAlert(err.message, 'danger');
  }
});

// Register Form Submit
$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  setAuthAlert(null);
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData);

  // If password fields left empty, default to 0829
  if (!payload.password && !payload.confirmPassword) {
    payload.password = '0829';
    payload.confirmPassword = '0829';
  } else if (payload.password !== payload.confirmPassword) {
    setAuthAlert('Passwords do not match', 'danger');
    return;
  }

  try {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAuthAlert(res.message, 'success');
    e.target.reset();
    // Switch to login tab
    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
    }, 1500);
  } catch (err) {
    setAuthAlert(err.message, 'danger');
  }
});

// Logout with confirmation
function handleLogout() {
  const isQuizActive = Boolean(state.activeQuizAttempt);
  const quizWarning = isQuizActive
    ? `<div class="alert-message alert-danger" style="margin-top: 1rem;">
         ⚠️ <strong>Active Assessment in Progress</strong><br>
         You are currently taking a quiz! Logging out will not pause the timer and may forfeit your attempt.
       </div>`
    : '';

  openModal(
    'Confirm Logout',
    `
      <p style="font-size: 0.95rem; color: var(--text-main);">
        Are you sure you want to log out of your session as <strong>${escapeHtml(state.user?.firstName || '')} ${escapeHtml(state.user?.surname || '')}</strong> (${escapeHtml(state.user?.role || 'account')})?
      </p>
      ${quizWarning}
    `,
    `<button id="btn-confirm-logout" class="btn btn-danger">Yes, Log Out</button>`,
    'Cancel'
  );

  const confirmBtn = $('#btn-confirm-logout');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Logging out...';
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch (e) {
        // ignore
      }
      state.user = null;
      location.reload();
    });
  }
}

/* ==========================================================================
   DASHBOARD INITIALIZATION & NAVIGATION
   ========================================================================== */

async function initDashboard() {
  $('#auth-view').style.display = 'none';

  // Render Account Area in Topbar
  const accountArea = $('#account-area');
  accountArea.innerHTML = `
    <div class="user-badge">
      <span>${escapeHtml(state.user.firstName)} ${escapeHtml(state.user.surname)}</span>
      <span class="role-pill role-${state.user.role}">${state.user.role}</span>
    </div>
    <button id="btn-logout" class="btn btn-secondary btn-sm">Log Out</button>
  `;
  $('#btn-logout').addEventListener('click', handleLogout);

  // Load Course and Curriculum
  const courseRes = await api('/courses/current');
  state.course = courseRes.course;
  state.modules = courseRes.modules;

  if (state.user.role === 'faculty') {
    $('#faculty-view').style.display = 'block';
    $('#student-view').style.display = 'none';
    initFacultyView();
  } else {
    $('#student-view').style.display = 'block';
    $('#faculty-view').style.display = 'none';
    initStudentView(courseRes.stats);
  }
}

/* ==========================================================================
   STUDENT WORKFLOW & LESSON VIEWER
   ========================================================================== */

function initStudentView(stats) {
  updateStudentStats(stats);
  renderStudentCurriculum();

  // Student Navigation Tabs
  $$('[data-student-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('[data-student-tab]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const isCurriculum = tab.dataset.studentTab === 'curriculum';
      $('#student-curriculum-panel').style.display = isCurriculum ? 'grid' : 'none';
      $('#student-progress-panel').style.display = isCurriculum ? 'none' : 'block';
      if (!isCurriculum) {
        loadStudentGradebookSummary();
      }
    });
  });

  // Export my transcript PDF button
  $('#btn-export-my-pdf').addEventListener('click', async () => {
    try {
      const blob = await api('/exports/my-summary/pdf');
      triggerFileDownload(blob, `DataMining_ITEP411T_Transcript_${state.user.username}.pdf`);
    } catch (e) {
      alert(e.message);
    }
  });

  // Select first unlocked chapter by default
  const allChapters = state.modules.flatMap((m) => m.chapters);
  const firstAvailable = allChapters.find((c) => c.status !== 'locked');
  if (firstAvailable) {
    loadChapter(firstAvailable.id);
  }
}

function updateStudentStats(stats) {
  if (!stats) return;
  $('#student-stat-completion').textContent = `${stats.completionPercentage}%`;
  $('#student-stat-passed').textContent = `${stats.passedChapters} / ${stats.totalChapters}`;
  $('#student-stat-average').textContent = stats.averageScore !== null ? `${stats.averageScore}%` : 'N/A';
  $('#student-stat-remaining').textContent = stats.remainingAssessments;
}

function renderStudentCurriculum() {
  const container = $('#student-module-tree');
  container.innerHTML = state.modules
    .map(
      (m) => `
    <div class="module-group">
      <div class="module-title">Module ${m.moduleNumber}: ${escapeHtml(m.title)}</div>
      ${m.chapters
        .map((c) => {
          const isActive = c.id === state.selectedChapterId;
          const badgeClass = `badge-${c.status}`;
          let statusText = c.status.toUpperCase();
          if (c.status === 'passed' && c.bestScore !== null) {
            statusText = `PASSED · ${c.bestScore}/20`;
          } else if (c.status === 'failed' && c.bestScore !== null) {
            statusText = `FAILED · ${c.bestScore}/20`;
          }

          return `
          <button class="chapter-btn ${isActive ? 'active' : ''}"
                  data-chap-id="${c.id}"
                  ${c.status === 'locked' ? 'disabled title="Complete previous chapter with ≥ 75% to unlock"' : ''}>
            <div class="chapter-info">
              <span class="chapter-name">Ch ${c.chapterNumber}: ${escapeHtml(c.title)}</span>
            </div>
            <span class="chapter-badge ${badgeClass}">${statusText}</span>
          </button>
        `;
        })
        .join('')}
    </div>
  `
    )
    .join('');

  container.querySelectorAll('[data-chap-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      loadChapter(Number(btn.dataset.chapId));
    });
  });
}

async function loadChapter(chapterId) {
  state.selectedChapterId = chapterId;
  renderStudentCurriculum();

  const workspace = $('#student-workspace');
  workspace.innerHTML = `<div style="text-align: center; padding: 2rem;">Loading chapter material...</div>`;

  try {
    const data = await api(`/chapters/${chapterId}`);
    const { chapter, lesson, files, quiz, studentProgress } = data;

    state.slides = lesson.slides || [];
    state.activeSlideIndex = 0;

    // Check if passed or can take quiz
    const isPassed = studentProgress?.status === 'passed';
    const isFailed = studentProgress?.status === 'failed';
    const attemptsCount = studentProgress?.attempts_count || 0;
    const bestScore = studentProgress?.best_score !== null ? studentProgress.best_score : null;

    workspace.innerHTML = `
      <!-- Chapter Header -->
      <div style="border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <span class="chapter-badge badge-available">Module ${chapter.moduleNumber} · Chapter ${chapter.chapterNumber}</span>
        <h1 style="margin: 0.5rem 0 0.25rem 0;">${escapeHtml(chapter.title)}</h1>
        <p class="stat-meta">${escapeHtml(chapter.description || chapter.moduleTitle)}</p>
      </div>

      <!-- Learning Objectives -->
      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.5rem;">
        <h4 style="color: var(--primary); margin-bottom: 0.5rem;">🎯 Learning Objectives</h4>
        <ul style="padding-left: 1.25rem; font-size: 0.9rem;">
          ${lesson.objectives.map((obj) => `<li style="margin-bottom: 0.25rem;">${escapeHtml(obj)}</li>`).join('')}
        </ul>
      </div>

      <!-- Interactive Presentation Slide Carousel -->
      ${state.slides.length > 0 ? `
        <h4>Interactive Lecture Slides</h4>
        <div id="slide-carousel-container" class="slide-viewer">
          <div id="slide-content-area" class="slide-content"></div>
          <div class="slide-nav">
            <button id="btn-slide-prev" class="btn btn-secondary btn-sm">◀ Previous</button>
            <span id="slide-page-indicator" class="slide-indicator">Slide 1 of ${state.slides.length}</span>
            <button id="btn-slide-next" class="btn btn-secondary btn-sm">Next ▶</button>
          </div>
        </div>
      ` : ''}

      <!-- Detailed Lesson Content -->
      <div style="margin: 1.5rem 0;">
        <h3>Lesson Study Material</h3>
        <div style="line-height: 1.7; font-size: 0.95rem; margin-top: 0.75rem; white-space: pre-line;">${escapeHtml(lesson.content)}</div>
      </div>

      <!-- Key Concepts Callout -->
      ${lesson.keyConcepts ? `
        <div class="concepts-callout">
          <h4>💡 Key Concepts & Core Takeaways</h4>
          <p style="font-size: 0.9rem; margin-top: 0.25rem;">${escapeHtml(lesson.keyConcepts)}</p>
        </div>
      ` : ''}

      <!-- Downloadable Materials -->
      ${files && files.length > 0 ? `
        <div style="margin: 1.5rem 0; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
          <h4 style="margin-bottom: 0.5rem;">📎 Downloadable Lecture Materials</h4>
          <ul style="list-style: none; padding-left: 0;">
            ${files.map((f) => `
              <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid #f1f5f9;">
                <span>📄 ${escapeHtml(f.name)} <small class="stat-meta">(${Math.round(f.sizeBytes / 1024)} KB)</small></span>
                <a href="/api/lesson-files/${f.id}/download" class="btn btn-secondary btn-sm" target="_blank" download>Download</a>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Quiz Launch Card -->
      <div style="background: #f0fdf4; border: 2px solid ${isPassed ? 'var(--success)' : 'var(--primary-border)'}; border-radius: var(--radius-md); padding: 1.5rem; margin-top: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="color: var(--text-main);">Chapter ${chapter.chapterNumber} Assessment Quiz</h3>
            <p class="stat-meta" style="margin-top: 0.25rem;">
              • Exactly 20 Questions &nbsp;|&nbsp; • 10-Minute Time Limit &nbsp;|&nbsp; • Passing Threshold: 75% (15 / 20)
            </p>
            ${bestScore !== null ? `
              <p style="margin-top: 0.5rem; font-weight: 600; color: ${isPassed ? 'var(--success)' : 'var(--danger)'};">
                Your Highest Score: ${bestScore} / 20 (${(bestScore / 20) * 100}%) · Status: ${studentProgress.status.toUpperCase()} (${attemptsCount} attempts)
              </p>
            ` : `<p style="margin-top: 0.5rem; color: var(--text-muted);">You have not attempted this assessment yet.</p>`}
          </div>
          <div>
            ${quiz && quiz.status === 'published' ? `
              <button id="btn-start-quiz" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-size: 1rem;">
                ${isPassed ? 'Retake Quiz for Higher Score' : (attemptsCount > 0 ? 'Retake Assessment' : 'Start 10-Minute Quiz')}
              </button>
            ` : `<span class="stat-meta">Quiz currently in draft</span>`}
          </div>
        </div>
      </div>

      <!-- Previous / Next Navigation -->
      <div style="display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div>
          ${chapter.previousChapterId ? `<button id="btn-prev-chapter" class="btn btn-secondary">◀ Previous Chapter</button>` : ''}
        </div>
        <div>
          ${chapter.nextChapterId ? `
            <button id="btn-next-chapter" class="btn btn-secondary" ${!isPassed ? 'disabled title="Pass this chapter to unlock next"' : ''}>
              Next Chapter ▶
            </button>
          ` : '<span class="stat-meta">Final Course Chapter</span>'}
        </div>
      </div>
    `;

    // Hook up slide carousel
    if (state.slides.length > 0) {
      renderSlide();
      $('#btn-slide-prev').addEventListener('click', () => {
        if (state.activeSlideIndex > 0) {
          state.activeSlideIndex--;
          renderSlide();
        }
      });
      $('#btn-slide-next').addEventListener('click', () => {
        if (state.activeSlideIndex < state.slides.length - 1) {
          state.activeSlideIndex++;
          renderSlide();
        }
      });
    }

    // Hook up quiz launch
    const startQuizBtn = $('#btn-start-quiz');
    if (startQuizBtn && quiz) {
      startQuizBtn.addEventListener('click', () => startQuizSession(quiz.id, chapter));
    }

    // Hook up prev/next navigation
    if (chapter.previousChapterId) {
      $('#btn-prev-chapter').addEventListener('click', () => loadChapter(chapter.previousChapterId));
    }
    if (chapter.nextChapterId) {
      $('#btn-next-chapter').addEventListener('click', () => loadChapter(chapter.nextChapterId));
    }
  } catch (err) {
    workspace.innerHTML = `<div class="alert-message alert-danger">${escapeHtml(err.message)}</div>`;
  }
}

function renderSlide() {
  const slide = state.slides[state.activeSlideIndex];
  if (!slide) return;

  $('#slide-content-area').innerHTML = `
    <h3>${escapeHtml(slide.title)}</h3>
    <h4>${escapeHtml(slide.subtitle || '')}</h4>
    <ul class="slide-bullets">
      ${(slide.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
    </ul>
  `;
  $('#slide-page-indicator').textContent = `Slide ${state.activeSlideIndex + 1} of ${state.slides.length}`;
}

/* ==========================================================================
   20-QUESTION QUIZ ENGINE (10-MIN TIMER & GRADING)
   ========================================================================== */

async function startQuizSession(quizId, chapter) {
  const workspace = $('#student-workspace');
  workspace.innerHTML = `<div style="text-align: center; padding: 2rem;">Preparing assessment environment...</div>`;

  try {
    const attemptData = await api(`/quiz-attempts/start/${quizId}`, { method: 'POST' });
    state.activeQuizAttempt = {
      attemptId: attemptData.attemptId,
      quizId,
      chapter,
      startedAt: new Date(attemptData.startedAt),
      timeLimitSeconds: attemptData.timeLimitSeconds,
      questions: attemptData.questions,
      currentIndex: 0,
      answers: new Map() // questionId -> selectedOptionId
    };

    renderActiveQuiz();
  } catch (err) {
    workspace.innerHTML = `
      <div class="alert-message alert-danger">${escapeHtml(err.message)}</div>
      <button class="btn btn-secondary" onclick="loadChapter(${chapter.id})">Return to Lesson</button>
    `;
  }
}

function renderActiveQuiz() {
  const quiz = state.activeQuizAttempt;
  const workspace = $('#student-workspace');

  workspace.innerHTML = `
    <!-- Sticky Timer Header -->
    <div class="quiz-header">
      <div>
        <h4 style="margin: 0; color: #ffffff;">Chapter ${quiz.chapter.chapterNumber} Assessment</h4>
        <span class="stat-meta" id="quiz-question-progress" style="color: #94a3b8;">Question 1 of 20</span>
      </div>
      <div class="quiz-timer" id="quiz-countdown">10:00</div>
    </div>

    <!-- Question Palette (1-20) -->
    <div class="palette-grid" id="quiz-palette">
      ${quiz.questions
        .map(
          (q, idx) => `
        <button class="palette-btn ${idx === quiz.currentIndex ? 'active' : ''} ${quiz.answers.has(q.id) ? 'answered' : ''}"
                data-palette-idx="${idx}">${idx + 1}</button>
      `
        )
        .join('')}
    </div>

    <!-- Current Question Card -->
    <div class="question-card" id="quiz-question-container"></div>

    <!-- Bottom Actions -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <button id="btn-quiz-prev" class="btn btn-secondary">◀ Previous Question</button>
      <div>
        <button id="btn-quiz-submit" class="btn btn-primary" style="background: var(--success);">
          Finish & Submit Assessment
        </button>
      </div>
      <button id="btn-quiz-next" class="btn btn-secondary">Next Question ▶</button>
    </div>
  `;

  // Start Countdown Timer
  startQuizCountdown();

  // Palette button clicks
  $$('#quiz-palette [data-palette-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      quiz.currentIndex = Number(btn.dataset.paletteIdx);
      renderCurrentQuestionCard();
    });
  });

  // Prev / Next button clicks
  $('#btn-quiz-prev').addEventListener('click', () => {
    if (quiz.currentIndex > 0) {
      quiz.currentIndex--;
      renderCurrentQuestionCard();
    }
  });

  $('#btn-quiz-next').addEventListener('click', () => {
    if (quiz.currentIndex < quiz.questions.length - 1) {
      quiz.currentIndex++;
      renderCurrentQuestionCard();
    }
  });

  // Submit button
  $('#btn-quiz-submit').addEventListener('click', () => {
    confirmSubmitQuiz(false);
  });

  // Render question card
  renderCurrentQuestionCard();
}

function renderCurrentQuestionCard() {
  const quiz = state.activeQuizAttempt;
  const q = quiz.questions[quiz.currentIndex];

  $('#quiz-question-progress').textContent = `Question ${quiz.currentIndex + 1} of ${quiz.questions.length}`;

  // Update palette active states
  $$('#quiz-palette .palette-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === quiz.currentIndex);
    const qObj = quiz.questions[idx];
    btn.classList.toggle('answered', quiz.answers.has(qObj.id));
  });

  // Update button states
  $('#btn-quiz-prev').disabled = quiz.currentIndex === 0;
  $('#btn-quiz-next').disabled = quiz.currentIndex === quiz.questions.length - 1;

  const currentSelectedOptId = quiz.answers.get(q.id);

  const container = $('#quiz-question-container');
  container.innerHTML = `
    <div class="question-prompt">
      ${quiz.currentIndex + 1}. ${escapeHtml(q.questionText)}
    </div>
    <div class="options-list">
      ${q.options
        .map(
          (opt) => `
        <label class="option-label ${currentSelectedOptId === opt.id ? 'selected' : ''}">
          <input type="radio" name="opt-${q.id}" value="${opt.id}" ${currentSelectedOptId === opt.id ? 'checked' : ''}>
          <span><strong>${opt.label}.</strong> ${escapeHtml(opt.text)}</span>
        </label>
      `
        )
        .join('')}
    </div>
  `;

  // Option selection handler
  container.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedId = Number(radio.value);
      quiz.answers.set(q.id, selectedId);
      renderCurrentQuestionCard();
    });
  });
}

function startQuizCountdown() {
  if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);

  const quiz = state.activeQuizAttempt;
  const timerEl = $('#quiz-countdown');

  const updateTimer = () => {
    const elapsedSeconds = Math.floor((Date.now() - quiz.startedAt.getTime()) / 1000);
    const remainingSeconds = quiz.timeLimitSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      clearInterval(state.quizTimerInterval);
      timerEl.textContent = '00:00';
      timerEl.classList.add('timer-warning');
      alert('Time limit expired! Your answers are being submitted automatically.');
      confirmSubmitQuiz(true);
      return;
    }

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (remainingSeconds <= 120) {
      timerEl.classList.add('timer-warning');
    }
  };

  updateTimer();
  state.quizTimerInterval = setInterval(updateTimer, 1000);
}

async function confirmSubmitQuiz(isTimeout = false) {
  const quiz = state.activeQuizAttempt;
  const answeredCount = quiz.answers.size;
  const totalCount = quiz.questions.length;

  if (!isTimeout && answeredCount < totalCount) {
    if (!confirm(`You have only answered ${answeredCount} of ${totalCount} questions. Submit anyway?`)) {
      return;
    }
  }

  if (state.quizTimerInterval) clearInterval(state.quizTimerInterval);

  const workspace = $('#student-workspace');
  workspace.innerHTML = `<div style="text-align: center; padding: 2rem;">Grading assessment against authoritative answer key...</div>`;

  try {
    const payload = {
      isTimeout,
      answers: Array.from(quiz.answers.entries()).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }))
    };

    const result = await api(`/quiz-attempts/submit/${quiz.attemptId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    renderQuizResultScreen(result, quiz.chapter);
  } catch (err) {
    workspace.innerHTML = `
      <div class="alert-message alert-danger">${escapeHtml(err.message)}</div>
      <button class="btn btn-secondary" onclick="loadChapter(${quiz.chapter.id})">Return to Chapter</button>
    `;
  }
}

function renderQuizResultScreen(result, chapter) {
  const workspace = $('#student-workspace');
  const isPassed = result.passed;

  workspace.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">${isPassed ? '🎉' : '📚'}</div>
      <h2>${isPassed ? 'Assessment Passed!' : 'Assessment Completed - Retake Available'}</h2>
      <p class="stat-meta" style="margin-bottom: 1.5rem;">Chapter ${chapter.chapterNumber}: ${escapeHtml(chapter.title)}</p>

      <div style="display: inline-block; background: ${isPassed ? 'var(--success-bg)' : 'var(--danger-bg)'};
                  border: 2px solid ${isPassed ? 'var(--success-border)' : 'var(--danger-border)'};
                  border-radius: var(--radius-md); padding: 1.5rem 2.5rem; margin-bottom: 2rem;">
        <span style="font-size: 2.5rem; font-weight: 800; color: ${isPassed ? 'var(--success)' : 'var(--danger)'};">
          ${result.correctAnswers} / ${result.totalQuestions}
        </span>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-top: 0.25rem;">
          Score: ${result.scorePercentage}%
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
          Passing Criterion: 15 / 20 (75%)
        </div>
      </div>

      <div style="max-width: 500px; margin: 0 auto 2rem auto; font-size: 0.95rem; line-height: 1.6;">
        ${isPassed ? `
          <div class="alert-message alert-success">
            <strong>Well Done!</strong> You satisfied the university requirement.
            ${result.nextChapterUnlocked ? `Chapter ${chapter.chapterNumber + 1} has now been unlocked!` : ''}
          </div>
        ` : `
          <div class="alert-message alert-danger">
            <strong>Keep practicing!</strong> You need at least 15 correct answers to pass and unlock the next chapter.
            You can review the lecture notes and slides, then retake this assessment.
          </div>
        `}
      </div>

      <div style="display: flex; justify-content: center; gap: 1rem;">
        <button class="btn btn-secondary" onclick="loadChapter(${chapter.id})">Review Chapter Lesson</button>
        ${!isPassed ? `
          <button class="btn btn-primary" onclick="loadChapter(${chapter.id})">Retake Quiz</button>
        ` : `
          ${chapter.nextChapterId ? `
            <button class="btn btn-primary" onclick="loadChapter(${chapter.nextChapterId})">Proceed to Next Chapter ▶</button>
          ` : `
            <button class="btn btn-primary" onclick="document.querySelector('[data-student-tab=my-progress]').click()">View Final Grade Summary</button>
          `}
        `}
      </div>
    </div>
  `;

  // Refresh curriculum state and statistics
  api('/courses/current').then((cData) => {
    state.modules = cData.modules;
    updateStudentStats(cData.stats);
    renderStudentCurriculum();
  });
}

// Student Gradebook Summary Tab
async function loadStudentGradebookSummary() {
  const tbody = $('#my-grades-table-body');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading gradebook summary...</td></tr>`;

  try {
    const data = await api('/gradebook/my-summary');
    tbody.innerHTML = data.chapters
      .map((c) => {
        const isPassed = c.status === 'passed';
        return `
        <tr>
          <td><strong>Chapter ${c.chapterNumber}</strong>: ${escapeHtml(c.title)}</td>
          <td>Module ${c.moduleNumber}</td>
          <td>${c.attemptsCount}</td>
          <td>${c.bestScore !== null ? `<strong>${c.bestScore} / 20</strong> (${c.bestPercentage}%)` : '-'}</td>
          <td><span class="chapter-badge badge-${c.status}">${c.status.toUpperCase()}</span></td>
          <td>${formatDate(c.passedAt)}</td>
        </tr>
      `;
      })
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="alert-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ==========================================================================
   FACULTY WORKFLOWS & MANAGEMENT PANELS
   ========================================================================== */

function initFacultyView() {
  renderFacultyCurriculum();
  populateFacultyChapterDropdowns();

  // Tab switching
  $$('[data-faculty-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('[data-faculty-tab]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.facultyTab;
      $('#fac-curriculum-panel').style.display = tabName === 'curriculum' ? 'grid' : 'none';
      $('#fac-quizzes-panel').style.display = tabName === 'quizzes' ? 'block' : 'none';
      $('#fac-topic-gradebook-panel').style.display = tabName === 'topic-gradebook' ? 'block' : 'none';
      $('#fac-master-gradebook-panel').style.display = tabName === 'master-gradebook' ? 'block' : 'none';
      $('#fac-audit-panel').style.display = tabName === 'audit-logs' ? 'block' : 'none';
      $('#fac-users-panel').style.display = tabName === 'user-mgmt' ? 'block' : 'none';

      if (tabName === 'topic-gradebook') loadFacultyTopicGradebook();
      if (tabName === 'master-gradebook') loadFacultyMasterGradebook();
      if (tabName === 'audit-logs') loadFacultyAuditLogs();
      if (tabName === 'user-mgmt') loadFacultyUserList();
      if (tabName === 'quizzes') loadFacultyQuizEditor();
    });
  });

  // Save lesson handler
  $('#fac-btn-save-lesson').addEventListener('click', saveFacultyLessonChanges);

  // Upload file handler
  $('#fac-btn-upload-file').addEventListener('click', uploadFacultyMaterialFile);

  // Quiz chapter select
  $('#fac-quiz-chap-select').addEventListener('change', loadFacultyQuizEditor);
  $('#fac-btn-toggle-publish').addEventListener('click', toggleFacultyQuizPublish);
  $('#fac-btn-reset-default-quiz').addEventListener('click', resetFacultyDefaultQuiz);
  $('#fac-btn-import-quiz').addEventListener('click', importFacultyQuizQuestions);

  // Topic Gradebook select & sort
  $('#topic-gb-chap-select').addEventListener('change', loadFacultyTopicGradebook);
  $('#topic-gb-sort-select').addEventListener('change', loadFacultyTopicGradebook);

  // Topic Exports
  $('#btn-export-topic-pdf').addEventListener('click', () => exportTopicGradebook('pdf'));
  $('#btn-export-topic-xlsx').addEventListener('click', () => exportTopicGradebook('xlsx'));
  $('#btn-export-topic-csv').addEventListener('click', () => exportTopicGradebook('csv'));

  // Master Exports
  $('#btn-export-master-pdf').addEventListener('click', () => exportMasterGradebook('pdf'));
  $('#btn-export-master-xlsx').addEventListener('click', () => exportMasterGradebook('xlsx'));
  $('#btn-export-master-csv').addEventListener('click', () => exportMasterGradebook('csv'));

  // Audit Refresh
  $('#btn-refresh-audit').addEventListener('click', loadFacultyAuditLogs);

  // Provision Faculty Form
  $('#form-create-faculty').addEventListener('submit', createFacultyAccountSubmit);

  // Load Chapter 1 by default
  const allChapters = state.modules.flatMap((m) => m.chapters);
  if (allChapters.length > 0) {
    loadFacultyChapterEditor(allChapters[0].id);
  }
}

function populateFacultyChapterDropdowns() {
  const allChapters = state.modules.flatMap((m) => m.chapters);
  const optionsHtml = allChapters
    .map((c) => `<option value="${c.id}">Chapter ${c.chapterNumber}: ${escapeHtml(c.title)}</option>`)
    .join('');

  $('#fac-quiz-chap-select').innerHTML = optionsHtml;
  $('#topic-gb-chap-select').innerHTML = optionsHtml;
}

function renderFacultyCurriculum() {
  const container = $('#fac-module-tree');
  container.innerHTML = state.modules
    .map(
      (m) => `
    <div class="module-group">
      <div class="module-title">Module ${m.moduleNumber}: ${escapeHtml(m.title)}</div>
      ${m.chapters
        .map((c) => `
        <button class="chapter-btn ${c.id === state.selectedChapterId ? 'active' : ''}" data-fac-chap="${c.id}">
          <div class="chapter-info">
            <span class="chapter-name">Ch ${c.chapterNumber}: ${escapeHtml(c.title)}</span>
          </div>
          <span class="chapter-badge badge-available">EDIT</span>
        </button>
      `)
        .join('')}
    </div>
  `
    )
    .join('');

  container.querySelectorAll('[data-fac-chap]').forEach((btn) => {
    btn.addEventListener('click', () => {
      loadFacultyChapterEditor(Number(btn.dataset.facChap));
    });
  });
}

async function loadFacultyChapterEditor(chapterId) {
  state.selectedChapterId = chapterId;
  renderFacultyCurriculum();

  try {
    const data = await api(`/chapters/${chapterId}`);
    const { chapter, lesson, files } = data;

    $('#fac-edit-chap-badge').textContent = `Chapter ${chapter.chapterNumber} (Module ${chapter.moduleNumber})`;
    $('#fac-edit-chap-title').textContent = chapter.title;

    $('#fac-edit-overview').value = lesson.overview || '';
    $('#fac-edit-objectives').value = (lesson.objectives || []).join('\n');
    $('#fac-edit-content').value = lesson.content || '';
    $('#fac-edit-concepts').value = lesson.keyConcepts || '';

    // Render Slide Preview
    const slideBox = $('#fac-slides-preview');
    slideBox.innerHTML = `
      <div class="slide-content">
        <h3>Slides Editor / Preview (${(lesson.slides || []).length} slides configured)</h3>
        <p class="stat-meta">Lecture slides automatically synchronize with this chapter's interactive student viewer.</p>
        <ul class="slide-bullets">
          ${(lesson.slides || []).map((s) => `<li><strong>${escapeHtml(s.title)}</strong> - ${escapeHtml(s.subtitle || '')}</li>`).join('')}
        </ul>
      </div>
    `;

    // Render Uploaded Files
    const filesList = $('#fac-files-list');
    filesList.innerHTML = (files || []).length === 0
      ? '<p class="stat-meta">No files uploaded yet.</p>'
      : `
      <ul style="list-style: none; padding-left: 0;">
        ${files.map((f) => `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid var(--border-color);">
            <span>📄 ${escapeHtml(f.name)} (${Math.round(f.sizeBytes / 1024)} KB)</span>
            <div style="display: flex; gap: 0.5rem;">
              <a href="/api/lesson-files/${f.id}/download" class="btn btn-secondary btn-sm" target="_blank" download>Download</a>
              <button class="btn btn-danger btn-sm" onclick="deleteFacultyFile(${f.id})">Delete</button>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  } catch (err) {
    alert(err.message);
  }
}

async function saveFacultyLessonChanges() {
  const chapterId = state.selectedChapterId;
  const overview = $('#fac-edit-overview').value;
  const objectives = $('#fac-edit-objectives').value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const content = $('#fac-edit-content').value;
  const keyConcepts = $('#fac-edit-concepts').value;

  try {
    await api(`/lessons/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify({ overview, objectives, content, keyConcepts })
    });
    alert('Lesson changes saved successfully.');
  } catch (err) {
    alert(err.message);
  }
}

async function uploadFacultyMaterialFile() {
  const fileInput = $('#fac-file-input');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please choose a PDF or PowerPoint file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    await api(`/lesson-files/upload/${state.selectedChapterId}`, {
      method: 'POST',
      body: formData
    });
    fileInput.value = '';
    loadFacultyChapterEditor(state.selectedChapterId);
    alert('File uploaded successfully.');
  } catch (err) {
    alert(err.message);
  }
}

window.deleteFacultyFile = async function (fileId) {
  if (!confirm('Are you sure you want to delete this lecture material?')) return;
  try {
    await api(`/lesson-files/${fileId}`, { method: 'DELETE' });
    loadFacultyChapterEditor(state.selectedChapterId);
  } catch (err) {
    alert(err.message);
  }
};

/* --- Faculty Quiz Management & Import --- */
async function loadFacultyQuizEditor() {
  const chapterId = Number($('#fac-quiz-chap-select').value);
  const container = $('#fac-quiz-questions-container');
  container.innerHTML = '<p class="stat-meta">Loading quiz questions...</p>';

  try {
    const data = await api(`/quizzes/chapter/${chapterId}`);
    const { quiz, questions } = data;

    $('#fac-btn-toggle-publish').textContent = quiz.status === 'published' ? 'Unpublish (Set to Draft)' : 'Publish Quiz';
    $('#fac-btn-toggle-publish').className = quiz.status === 'published' ? 'btn btn-secondary' : 'btn btn-primary';

    container.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4>${escapeHtml(quiz.title)} (Version ${quiz.version})</h4>
          <span class="chapter-badge ${quiz.status === 'published' ? 'badge-passed' : 'badge-failed'}">${quiz.status.toUpperCase()}</span>
          <span class="stat-meta" style="margin-left: 0.5rem;">Total Questions: ${questions.length} / 20</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${questions.map((q) => `
          <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1rem; background: #ffffff;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">Q${q.position}: ${escapeHtml(q.questionText)}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              ${q.options.map((opt) => `
                <div style="padding: 0.4rem 0.6rem; border-radius: 4px; font-size: 0.85rem;
                            background: ${opt.isCorrect ? '#dcfce7' : '#f8fafc'};
                            border: 1px solid ${opt.isCorrect ? '#86efac' : '#e2e8f0'};">
                  <strong>${opt.label}.</strong> ${escapeHtml(opt.text)}
                  ${opt.isCorrect ? ' <span style="color: var(--success); font-weight: 700;">✓ Correct</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-message alert-danger">${escapeHtml(err.message)}</div>`;
  }
}

async function toggleFacultyQuizPublish() {
  const chapterId = Number($('#fac-quiz-chap-select').value);
  const currentText = $('#fac-btn-toggle-publish').textContent;
  const publish = currentText.includes('Publish Quiz');

  try {
    await api(`/quizzes/chapter/${chapterId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ published: publish })
    });
    loadFacultyQuizEditor();
  } catch (err) {
    alert(err.message);
  }
}

async function resetFacultyDefaultQuiz() {
  if (!confirm('Reset this quiz to the official 20 curriculum-aligned questions?')) return;
  const chapterId = Number($('#fac-quiz-chap-select').value);
  try {
    const res = await api(`/quizzes/chapter/${chapterId}/reset-default`, { method: 'POST' });
    alert(res.message);
    loadFacultyQuizEditor();
  } catch (err) {
    alert(err.message);
  }
}

async function importFacultyQuizQuestions() {
  const fileInput = $('#fac-quiz-import-file');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please choose a JSON, CSV, or XLSX file with exactly 20 questions.');
    return;
  }

  const chapterId = Number($('#fac-quiz-chap-select').value);
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const res = await api(`/quizzes/chapter/${chapterId}/import`, {
      method: 'POST',
      body: formData
    });
    alert(res.message);
    fileInput.value = '';
    loadFacultyQuizEditor();
  } catch (err) {
    alert(err.message);
  }
}

/* --- Faculty Topic-Level Gradebook --- */
async function loadFacultyTopicGradebook() {
  const chapterId = Number($('#topic-gb-chap-select').value);
  const sortVal = $('#topic-gb-sort-select').value.split(':');
  const sortBy = sortVal[0];
  const sortOrder = sortVal[1];

  const tbody = $('#topic-gb-table-body');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Loading topic gradebook...</td></tr>`;

  try {
    const data = await api(`/gradebook/topic/${chapterId}?sortBy=${sortBy}&sortOrder=${sortOrder}`);
    $('#topic-gb-subtitle').textContent = `Chapter ${data.chapter.chapterNumber}: ${data.chapter.title} (Module ${data.chapter.moduleNumber})`;

    tbody.innerHTML = data.students.map((s) => `
      <tr>
        <td><strong>${escapeHtml(s.username)}</strong></td>
        <td>${escapeHtml(s.surname)}, ${escapeHtml(s.firstName)}</td>
        <td>${s.attemptsCount}</td>
        <td>${s.latestScore !== null ? `${s.latestScore} / 20` : '-'}</td>
        <td>${s.highestScore !== null ? `<strong>${s.highestScore} / 20</strong> (${s.highestPercentage}%)` : '-'}</td>
        <td><span class="chapter-badge badge-${s.status}">${s.status.toUpperCase()}</span></td>
        <td>${formatDate(s.latestAttemptAt)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewStudentAttemptsModal(${chapterId}, ${s.studentId}, '${escapeHtml(s.username)}')">
            Attempt History
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="alert-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

window.viewStudentAttemptsModal = async function (chapterId, studentId, username) {
  try {
    const data = await api(`/gradebook/topic/${chapterId}/student/${studentId}/attempts`);
    const attempts = data.attempts || [];

    const contentHtml = `
      <p style="margin-bottom: 1rem;"><strong>Student:</strong> ${escapeHtml(username)} (${data.student.first_name} ${data.student.surname})</p>
      ${attempts.length === 0 ? '<p class="stat-meta">No attempts recorded yet.</p>' : `
        <table class="data-table">
          <thead>
            <tr>
              <th>Attempt #</th>
              <th>Date & Time</th>
              <th>Score (/20)</th>
              <th>Percentage</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            ${attempts.map((a, idx) => `
              <tr>
                <td>Attempt ${attempts.length - idx}</td>
                <td>${formatDate(a.submitted_at || a.started_at)}</td>
                <td><strong>${a.correct_answers} / 20</strong></td>
                <td>${a.score_percentage}%</td>
                <td><span class="chapter-badge badge-${a.status}">${a.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    `;

    openModal(`Student Attempt Log — ${username}`, contentHtml);
  } catch (err) {
    alert(err.message);
  }
};

async function exportTopicGradebook(format) {
  const chapterId = Number($('#topic-gb-chap-select').value);
  try {
    const blob = await api(`/exports/topic/${chapterId}/${format}`);
    triggerFileDownload(blob, `ITEP411T_Ch${chapterId}_Gradebook.${format}`);
  } catch (err) {
    alert(err.message);
  }
}

/* --- Faculty Master Gradebook --- */
async function loadFacultyMasterGradebook() {
  const thead = $('#master-gb-head');
  const tbody = $('#master-gb-body');
  thead.innerHTML = '';
  tbody.innerHTML = `<tr><td colspan="17" style="text-align: center;">Loading master class gradebook...</td></tr>`;

  try {
    const data = await api('/gradebook/master');

    // Build header columns: Student, Ch 1 .. Ch 12, Total Attempts, Course Average, Passed, Completion %
    let headHtml = `<tr><th>Student</th>`;
    for (let i = 1; i <= 12; i++) {
      headHtml += `<th title="Chapter ${i}">Ch ${i}</th>`;
    }
    headHtml += `<th>Attempts</th><th>Average</th><th>Passed</th><th>Completion %</th><th>Actions</th></tr>`;
    thead.innerHTML = headHtml;

    tbody.innerHTML = data.students.map((s) => {
      let rowHtml = `<tr><td><strong>${escapeHtml(s.surname)}, ${escapeHtml(s.firstName)}</strong><br><small class="stat-meta">${escapeHtml(s.username)}</small></td>`;

      for (let ch = 1; ch <= 12; ch++) {
        const cData = s.chapters[ch];
        if (cData && cData.bestScore !== null) {
          const isPassed = cData.bestScore >= 15;
          rowHtml += `<td style="color: ${isPassed ? 'var(--success)' : 'var(--danger)'}; font-weight: ${isPassed ? '700' : '400'};">
            ${cData.bestScore}/20
          </td>`;
        } else {
          rowHtml += `<td style="color: var(--text-light);">-</td>`;
        }
      }

      rowHtml += `
        <td>${s.totalAttempts}</td>
        <td><strong>${s.averageScore !== null ? `${s.averageScore}%` : 'N/A'}</strong></td>
        <td>${s.passedCount} / 12</td>
        <td><span class="chapter-badge badge-available">${s.completionPercentage}%</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openProgressOverrideModal(${s.id}, '${escapeHtml(s.username)}')">
            Override
          </button>
        </td>
      </tr>`;
      return rowHtml;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="17" class="alert-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

window.openProgressOverrideModal = function (studentId, username) {
  const allChapters = state.modules.flatMap((m) => m.chapters);
  const contentHtml = `
    <p>Administrative override of sequential progression for student: <strong>${escapeHtml(username)}</strong></p>
    <form id="override-form" style="margin-top: 1rem;">
      <div class="form-group">
        <label>Select Chapter</label>
        <select id="override-chap-select" class="form-control">
          ${allChapters.map((c) => `<option value="${c.id}">Chapter ${c.chapterNumber}: ${escapeHtml(c.title)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>New Status</label>
        <select id="override-status-select" class="form-control">
          <option value="passed">Passed (Score threshold satisfied / credited)</option>
          <option value="available">Available (Unlocked for attempt)</option>
          <option value="locked">Locked</option>
        </select>
      </div>
      <div class="form-group">
        <label>Reason / Audit Justification (Required)</label>
        <textarea id="override-reason" class="form-control" rows="2" required placeholder="e.g. Approved transfer credit / accommodation waiver"></textarea>
      </div>
    </form>
  `;

  openModal(
    `Chapter Progress Override — ${username}`,
    contentHtml,
    `<button class="btn btn-primary" onclick="submitProgressOverride(${studentId})">Apply Override</button>`
  );
};

window.submitProgressOverride = async function (studentId) {
  const chapterId = Number($('#override-chap-select').value);
  const newStatus = $('#override-status-select').value;
  const reason = $('#override-reason').value.trim();

  if (!reason) {
    alert('Please provide a justification reason for the audit log.');
    return;
  }

  try {
    const res = await api('/gradebook/override', {
      method: 'POST',
      body: JSON.stringify({ studentId, chapterId, newStatus, reason })
    });
    alert(res.message);
    closeModal();
    loadFacultyMasterGradebook();
  } catch (err) {
    alert(err.message);
  }
};

async function exportMasterGradebook(format) {
  try {
    const blob = await api(`/exports/master/${format}`);
    triggerFileDownload(blob, `ITEP411T_Master_Gradebook.${format}`);
  } catch (err) {
    alert(err.message);
  }
}

/* --- Faculty Centralized Audit Logs --- */
async function loadFacultyAuditLogs() {
  const tbody = $('#audit-table-body');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Loading audit logs...</td></tr>`;

  try {
    const data = await api('/audit-logs?limit=50');
    tbody.innerHTML = (data.logs || []).map((l) => `
      <tr>
        <td>${formatDate(l.created_at)}</td>
        <td><strong>${escapeHtml(l.actor_username || 'SYSTEM')}</strong></td>
        <td><code>${escapeHtml(l.action)}</code></td>
        <td>${escapeHtml(l.entity_type)}</td>
        <td>${escapeHtml(l.entity_id || '-')}</td>
        <td><small class="stat-meta">${escapeHtml(l.ip_address || '-')}</small></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewAuditDetailsModal(${l.id})">
            Details
          </button>
        </td>
      </tr>
    `).join('');

    // Cache logs on window for modal inspection
    window.cachedLogs = new Map((data.logs || []).map((l) => [l.id, l]));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="alert-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

window.viewAuditDetailsModal = function (logId) {
  const log = window.cachedLogs?.get(logId);
  if (!log) return;

  const contentHtml = `
    <p><strong>Action:</strong> <code>${escapeHtml(log.action)}</code> | <strong>Entity:</strong> ${escapeHtml(log.entity_type)} #${escapeHtml(log.entity_id || '')}</p>
    <p><strong>Actor:</strong> ${escapeHtml(log.actor_username || 'SYSTEM')} | <strong>IP Address:</strong> ${escapeHtml(log.ip_address || '')}</p>
    <p><strong>Request ID:</strong> <code>${escapeHtml(log.request_id || 'N/A')}</code></p>
    <h4 style="margin: 1rem 0 0.5rem 0;">Structured Change Metadata</h4>
    <pre style="background: #0f172a; color: #38bdf8; padding: 1rem; border-radius: var(--radius-sm); overflow-x: auto; font-size: 0.85rem;">${escapeHtml(JSON.stringify(log.details, null, 2))}</pre>
  `;
  openModal(`Audit Event #${log.id}`, contentHtml);
};

/* --- Faculty User Administration --- */
async function loadFacultyUserList() {
  const tbody = $('#users-table-body');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Loading users...</td></tr>`;

  try {
    const data = await api('/users');
    tbody.innerHTML = data.users.map((u) => `
      <tr>
        <td><strong>${escapeHtml(u.username)}</strong></td>
        <td>${escapeHtml(u.surname)}, ${escapeHtml(u.first_name)}</td>
        <td><span class="role-pill role-${u.role}">${u.role}</span></td>
        <td><span class="chapter-badge ${u.is_active ? 'badge-passed' : 'badge-failed'}">${u.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
        <td>
          ${u.id !== state.user.id ? `
            <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus(${u.id}, ${!u.is_active})">
              ${u.is_active ? 'Deactivate' : 'Activate'}
            </button>
          ` : '<span class="stat-meta">Current User</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="alert-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

window.toggleUserStatus = async function (userId, isActive) {
  try {
    await api(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
    loadFacultyUserList();
  } catch (err) {
    alert(err.message);
  }
};

async function createFacultyAccountSubmit(e) {
  e.preventDefault();
  const username = $('#fac-new-username').value.trim();
  const firstName = $('#fac-new-firstname').value.trim();
  const surname = $('#fac-new-surname').value.trim();
  const password = $('#fac-new-password').value || '0829';

  try {
    const res = await api('/users/faculty', {
      method: 'POST',
      body: JSON.stringify({ username, firstName, surname, password })
    });
    alert(`Faculty account for ${username} created successfully.`);
    e.target.reset();
    loadFacultyUserList();
  } catch (err) {
    alert(err.message);
  }
}

/* ==========================================================================
   APP BOOTSTRAP
   ========================================================================== */
(async () => {
  try {
    // 1. Fetch initial CSRF token
    const csrfData = await api('/auth/csrf');
    state.csrfToken = csrfData.csrfToken;

    // 2. Check existing session
    const meData = await api('/auth/me');
    if (meData.user) {
      state.user = meData.user;
      state.csrfToken = meData.csrfToken || state.csrfToken;
      await initDashboard();
    }
  } catch (err) {
    // Unauthenticated user lands on sign-in screen
    $('#auth-view').style.display = 'block';
  }
})();
