// Player abstraction: read position/duration, seek. Features never touch Spotify's DOM for playback directly.
// Spotify's audio is DRM-protected (no accessible <audio>), so we drive the on-screen progress bar.
SX.player = (() => {
  const { SEL } = SX;
  const qs = (s) => document.querySelector(s);

  function parseTime(text) {
    if (!text) return null;
    const parts = text.trim().replace('-', '').split(':').map(Number);
    if (parts.some(Number.isNaN)) return null;
    return parts.reduce((acc, p) => acc * 60 + p, 0);
  }

  function duration() {
    const el = qs(SEL.duration);
    return el ? parseTime(el.textContent) : null; // seconds
  }

  // 0..1, read from the bar's CSS variable for sub-second precision; falls back to the time text.
  function fraction() {
    const bar = qs(SEL.progressBar);
    if (bar) {
      const v = parseFloat(getComputedStyle(bar).getPropertyValue('--progress-bar-transform'));
      if (!Number.isNaN(v)) return Math.min(1, Math.max(0, v / 100));
    }
    const d = duration();
    const p = parseTime(qs(SEL.position)?.textContent);
    return d && p != null ? Math.min(1, p / d) : null;
  }

  function position() {
    const f = fraction();
    const d = duration();
    return f == null || !d ? null : f * d; // seconds
  }

  function isPlaying() {
    const label = qs(SEL.playPause)?.getAttribute('aria-label') || '';
    return /pause/i.test(label);
  }

  function trackKey() {
    return qs(SEL.trackLink)?.getAttribute('href') || qs(SEL.trackInfo)?.textContent || null;
  }

  // Convert a mouse event on the progress bar into seconds.
  function positionFromEvent(e) {
    const bar = qs(SEL.progressBar);
    const d = duration();
    if (!bar || !d) return null;
    const r = bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * d;
  }

  function setRangeInput(wrap, f) {
    const input = wrap.querySelector('input[type="range"]');
    if (!input) return;
    const min = Number(input.min) || 0;
    const max = Number(input.max);
    if (!max) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(min + f * (max - min)));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function clickBar(bar, f) {
    const r = bar.getBoundingClientRect();
    const init = {
      bubbles: true, cancelable: true, view: window, button: 0,
      clientX: r.left + f * r.width, clientY: r.top + r.height / 2,
    };
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) {
      const Ctor = type.startsWith('pointer') ? PointerEvent : MouseEvent;
      bar.dispatchEvent(new Ctor(type, init));
    }
  }

  function seekTo(seconds) {
    const d = duration();
    const wrap = qs(SEL.progressWrap);
    const bar = qs(SEL.progressBar);
    if (!d || !wrap || !bar) return false;
    const f = Math.min(0.999, Math.max(0, seconds / d));
    setRangeInput(wrap, f);
    clickBar(bar, f);
    return true;
  }

  function seekBy(delta) {
    const p = position();
    return p == null ? false : seekTo(p + delta);
  }

  return { duration, position, isPlaying, trackKey, positionFromEvent, seekTo, seekBy };
})();
