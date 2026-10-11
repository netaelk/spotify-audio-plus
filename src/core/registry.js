// Feature registry. A feature is { id, init?(), mount?() }.
//   init()  : once, when the extension starts.
//   mount() : called (debounced) after every DOM change; must be idempotent. Create your UI lazily, then
//             call SX.ui.ensure(...) to (re)place it, because the page's React tree may re-render.
SX.registry = (() => {
  const features = [];
  let started = false;
  let scheduled = false;
  let lastTrack = null;

  function register(feature) {
    features.push(feature);
    if (started) feature.init?.();
  }

  function mountAll() {
    scheduled = false;
    for (const f of features) {
      try { f.mount?.(); } catch (e) { console.error(`[SX] ${f.id} mount failed`, e); }
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(mountAll, 50);
  }

  function checkTrack() {
    const key = SX.player.trackKey();
    if (key && key !== lastTrack) {
      const prev = lastTrack;
      lastTrack = key;
      if (prev !== null) SX.events.emit('trackchange', { from: prev, to: key });
    }
  }

  function start() {
    started = true;
    features.forEach((f) => { try { f.init?.(); } catch (e) { console.error(`[SX] ${f.id} init failed`, e); } });
    new MutationObserver(() => { schedule(); checkTrack(); }).observe(document.body, { childList: true, subtree: true });
    checkTrack();
    mountAll();
  }

  return { register, start };
})();
