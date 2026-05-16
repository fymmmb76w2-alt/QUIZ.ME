(() => {
  'use strict';

  const screens = {
    landing: document.getElementById('landing'),
    quiz: document.getElementById('quiz'),
    results: document.getElementById('results'),
  };

  const els = {
    xmlInput: document.getElementById('xmlInput'),
    xmlInput2: document.getElementById('xmlInput2'),
    loadError: document.getElementById('loadError'),
    progress: document.getElementById('progress'),
    timer: document.getElementById('timer'),
    questionText: document.getElementById('questionText'),
    answers: document.getElementById('answers'),
    actionBtn: document.getElementById('actionBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    feedback: document.getElementById('feedback'),
    elapsed: document.getElementById('elapsed'),
    rate: document.getElementById('rate'),
  };

  const state = {
    queue: [],          // remaining questions (objects)
    current: null,
    selected: new Set(),
    locked: false,
    startTime: 0,
    timerId: null,
    totalQuestions: 0,
    firstAttemptCorrect: 0,
    seenFirstAttempt: new Set(), // ids of questions whose first attempt has been recorded
    lastQuestions: null, // original parsed questions for replay
  };

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function setError(msg) {
    els.loadError.textContent = msg || '';
    els.loadError.hidden = !msg;
  }

  function parseXml(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const parseErr = doc.querySelector('parsererror');
    if (parseErr) throw new Error('Invalid XML: ' + parseErr.textContent.trim());

    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== 'quiz') {
      throw new Error('Root element must be <quiz>.');
    }

    const qNodes = Array.from(root.getElementsByTagName('question'));
    if (qNodes.length === 0) throw new Error('No <question> elements found.');

    const questions = qNodes.map((q, i) => {
      const textAttr = q.getAttribute('text');
      const textChildEl = q.querySelector(':scope > text');
      const text = (textAttr || (textChildEl ? textChildEl.textContent : '') || '').trim();
      if (!text) throw new Error(`Question ${i + 1} has no text.`);

      const aNodes = Array.from(q.getElementsByTagName('answer'));
      if (aNodes.length < 2) throw new Error(`Question ${i + 1} needs at least 2 answers.`);

      const answers = aNodes.map((a, j) => ({
        id: `${i}_${j}`,
        text: (a.textContent || '').trim(),
        correct: (a.getAttribute('correct') || '').trim().toLowerCase() === 'true',
      }));

      if (!answers.some(a => a.correct)) {
        throw new Error(`Question ${i + 1} has no correct answer.`);
      }

      return { id: `q${i}`, text, answers };
    });

    return questions;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz(questions) {
    state.lastQuestions = questions;
    state.queue = shuffle(questions);
    state.totalQuestions = questions.length;
    state.firstAttemptCorrect = 0;
    state.seenFirstAttempt = new Set();
    state.startTime = Date.now();
    startTimer();
    show('quiz');
    nextQuestion();
  }

  function startTimer() {
    stopTimer();
    state.timerId = setInterval(() => {
      els.timer.textContent = formatTime(Date.now() - state.startTime);
    }, 500);
    els.timer.textContent = '00:00';
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = n => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  function nextQuestion() {
    if (state.queue.length === 0) return finish();

    state.current = state.queue[0];
    state.selected.clear();
    state.locked = false;
    els.feedback.hidden = true;
    els.feedback.className = 'feedback';
    setAction('check');

    const remaining = state.queue.length;
    const done = state.totalQuestions - remaining;
    els.progress.textContent = `Question ${done + 1} — ${remaining} left`;

    els.questionText.textContent = state.current.text;
    renderAnswers(state.current);
  }

  function renderAnswers(q) {
    els.answers.innerHTML = '';
    const shuffled = shuffle(q.answers);
    shuffled.forEach(a => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer';
      btn.dataset.id = a.id;
      btn.innerHTML = `<span class="box" aria-hidden="true"></span><span class="label"></span>`;
      btn.querySelector('.label').textContent = a.text;
      btn.addEventListener('click', () => toggleAnswer(btn, a.id));
      els.answers.appendChild(btn);
    });
  }

  function toggleAnswer(btn, id) {
    if (state.locked) return;
    if (state.selected.has(id)) {
      state.selected.delete(id);
      btn.classList.remove('selected');
    } else {
      state.selected.add(id);
      btn.classList.add('selected');
    }
  }

  function checkAnswer() {
    if (state.locked) return;
    if (state.selected.size === 0) return;

    const q = state.current;
    const correctIds = new Set(q.answers.filter(a => a.correct).map(a => a.id));
    const selected = state.selected;

    const isCorrect =
      selected.size === correctIds.size &&
      [...selected].every(id => correctIds.has(id));

    // Record first-attempt result once per question id
    if (!state.seenFirstAttempt.has(q.id)) {
      state.seenFirstAttempt.add(q.id);
      if (isCorrect) state.firstAttemptCorrect += 1;
    }

    state.locked = true;

    // Color-code each answer button
    els.answers.querySelectorAll('.answer').forEach(btn => {
      const id = btn.dataset.id;
      const isCorrectAns = correctIds.has(id);
      const wasSelected = selected.has(id);

      btn.classList.add('locked');
      if (wasSelected && isCorrectAns) btn.classList.add('correct');
      else if (wasSelected && !isCorrectAns) btn.classList.add('wrong');
      else if (!wasSelected && isCorrectAns) btn.classList.add('missed');
    });

    els.feedback.hidden = false;
    if (isCorrect) {
      els.feedback.textContent = 'Correct. Moving on.';
      els.feedback.classList.add('ok');
      state.queue.shift();
      setAction(state.queue.length === 0 ? 'finish' : 'next');
    } else {
      els.feedback.textContent = 'Incorrect. This question will return later.';
      els.feedback.classList.add('bad');
      const failed = state.queue.shift();
      state.queue.push(failed);
      setAction('next');
    }
  }

  function finish() {
    stopTimer();
    const elapsedMs = Date.now() - state.startTime;
    els.elapsed.textContent = formatTime(elapsedMs);
    const rate = state.totalQuestions === 0
      ? 0
      : (state.firstAttemptCorrect / state.totalQuestions) * 100;
    els.rate.textContent =
      `${state.firstAttemptCorrect} / ${state.totalQuestions} (${rate.toFixed(1)}%)`;
    show('results');
  }

  function handleFile(file) {
    setError('');
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setError('Failed to read file.');
    reader.onload = () => {
      try {
        const questions = parseXml(String(reader.result));
        startQuiz(questions);
      } catch (e) {
        setError(e.message || 'Could not parse XML.');
        show('landing');
      }
    };
    reader.readAsText(file);
  }

  els.xmlInput.addEventListener('change', e => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  });

  els.xmlInput2.addEventListener('change', e => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  });

  function setAction(mode) {
    els.actionBtn.dataset.mode = mode;
    if (mode === 'check') els.actionBtn.textContent = 'Check';
    else if (mode === 'next') els.actionBtn.textContent = 'Next';
    else if (mode === 'finish') els.actionBtn.textContent = 'Finish';
  }

  function handleAction() {
    const mode = els.actionBtn.dataset.mode;
    if (mode === 'check') checkAnswer();
    else nextQuestion();
  }

  els.actionBtn.addEventListener('click', handleAction);

  els.repeatBtn.addEventListener('click', () => {
    if (state.lastQuestions) startQuiz(state.lastQuestions);
  });

  // Keyboard: Enter triggers the current action
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (!screens.quiz.classList.contains('active')) return;
    handleAction();
  });
})();
