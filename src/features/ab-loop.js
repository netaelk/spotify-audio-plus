// Feature: A-B loop button, placed right after the built-in repeat button.
// States: idle (grey "AB") -> setA ("A") -> setB ("B") -> active (green "AB") -> click -> idle.
// While picking A or B, either click the button (uses the current position) or click the progress bar.
(() => {
  const MIN_LOOP = 0.5;    // seconds
  const TICK_MS = 80;
  const COOLDOWN_MS = 400; // the bar takes a moment to update after we seek

  const LABELS = { idle: 'AB', setA: 'A', setB: 'B', active: 'AB' };
  const TITLES = {
    idle: 'A-B loop: click to set the start point',
    setA: 'Click the progress bar (or this button) to set point A. Esc cancels',
    setB: 'Click the progress bar (or this button) to set point B. Esc cancels',
    active: 'A-B loop on: click to cancel',
  };

  let btn;
  let state = 'idle';
  let a = null;
  let b = null;
  let timer = null;
  let lastSeek = 0;

  const label = (t) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16.5" font-size="${t.length > 1 ? 12 : 16}" ` +
    `font-weight="800" text-anchor="middle" stroke="none">${t}</text></svg>`;

  function render() {
    if (!btn) return;
    btn.dataset.state = state;
    btn.innerHTML = label(LABELS[state]);
    btn.title = TITLES[state];
    btn.setAttribute('aria-label', TITLES[state]);
    btn.setAttribute('aria-pressed', String(state === 'active'));
  }

  // Progress-bar overlay: a marker at A while picking B; light green (played) + dark green (still to play) once active.
  let overlay, playedSeg, restSeg;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'sx-loop';
    playedSeg = document.createElement('div');
    playedSeg.className = 'sx-loop-played';
    restSeg = document.createElement('div');
    restSeg.className = 'sx-loop-rest';
    overlay.append(playedSeg, restSeg);
  }

  function paintOverlay() {
    const bar = document.querySelector(SX.SEL.progressBar);
    const dur = SX.player.duration();
    const show = bar && dur && a != null && (state === 'setB' || state === 'active');
    if (!show) {
      if (overlay) overlay.remove();
      return;
    }
    if (!overlay) buildOverlay();
    if (overlay.parentElement !== bar) {
      if (getComputedStyle(bar).position === 'static') bar.classList.add('sx-loop-host');
      bar.appendChild(overlay);
    }
    const pct = (s) => Math.min(100, Math.max(0, (s / dur) * 100));
    if (state === 'setB') {
      overlay.dataset.mode = 'marker';
      overlay.style.left = `${pct(a)}%`;
      overlay.style.width = '';
      return;
    }
    const pos = SX.player.position();
    const split = pos == null ? a : Math.min(b, Math.max(a, pos));
    overlay.dataset.mode = 'range';
    overlay.style.left = `${pct(a)}%`;
    overlay.style.width = `${pct(b) - pct(a)}%`;
    const span = b - a;
    playedSeg.style.width = `${((split - a) / span) * 100}%`;
    restSeg.style.width = `${((b - split) / span) * 100}%`;
  }

  function setState(s) {
    state = s;
    clearInterval(timer);
    timer = s === 'active' ? setInterval(tick, TICK_MS) : null;
    render();
    paintOverlay();
  }

  function reset() {
    a = null;
    b = null;
    setState('idle');
  }

  function tick() {
    paintOverlay();
    if (Date.now() - lastSeek < COOLDOWN_MS) return;
    const p = SX.player.position();
    if (p != null && p >= b - 0.05) {
      lastSeek = Date.now();
      SX.player.seekTo(a);
    }
  }

  function commit(seconds) {
    if (seconds == null) return;
    if (state === 'setA') {
      a = seconds;
      setState('setB');
    } else if (state === 'setB') {
      if (Math.abs(seconds - a) < MIN_LOOP) return; // too short, keep waiting for a better B
      [a, b] = [Math.min(a, seconds), Math.max(a, seconds)];
      lastSeek = Date.now();
      SX.player.seekTo(a);
      setState('active');
    }
  }

  function onButton() {
    if (state === 'idle') setState('setA');
    else if (state === 'active') reset();
    else commit(SX.player.position());
  }

  function init() {
    // Capture phase so we read the click position before the page reacts to it.
    document.addEventListener('click', (e) => {
      if ((state === 'setA' || state === 'setB') && e.target.closest && e.target.closest(SX.SEL.progressWrap)) {
        commit(SX.player.positionFromEvent(e));
      }
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state !== 'idle') reset();
    });
    SX.events.on('trackchange', reset);
  }

  SX.registry.register({
    id: 'ab-loop',
    init,
    mount() {
      if (!btn) {
        btn = SX.ui.button({ id: 'ab-loop', title: TITLES.idle, html: '', onClick: onButton });
        btn.classList.add('sx-ab');
        render();
      }
      SX.ui.ensure(btn, 'after-repeat', 10);
      paintOverlay(); // re-attach if the page re-rendered the progress bar
    },
  });
})();
