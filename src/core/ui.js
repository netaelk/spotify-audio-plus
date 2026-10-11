// UI helpers: locate the player's control row and place our elements into named zones, in a stable order.
//   before-playpause : left of play/pause
//   after-playpause  : right of play/pause
//   after-repeat     : right of the built-in repeat button
SX.ui = (() => {
  const { SEL } = SX;
  const qs = (s) => document.querySelector(s);

  function layout() {
    const pp = qs(SEL.playPause);
    if (!pp) return null;
    const repeat = qs(SEL.repeat);
    let row = pp.parentElement;
    while (row && repeat && !row.contains(repeat)) row = row.parentElement;
    if (!row) return null;
    const slotOf = (n) => {
      while (n && n.parentElement !== row) n = n.parentElement;
      return n;
    };
    const pp_slot = slotOf(pp);
    return {
      row,
      repeatClass: repeat ? repeat.className : '',
      slots: {
        'before-playpause': pp_slot,
        'after-playpause': pp_slot,
        'after-repeat': repeat ? slotOf(repeat) : pp_slot,
      },
    };
  }

  // Idempotent: safe to call on every DOM mutation. Elements in a zone are sorted by `order` (left to right).
  function ensure(el, zone, order = 0) {
    const L = layout();
    if (!L) return false;
    const anchor = L.slots[zone];
    const before = zone === 'before-playpause';
    el.dataset.sxZone = zone;
    el.dataset.sxOrder = String(order);

    const run = [];
    if (before) {
      for (let n = anchor.previousElementSibling; n && n.dataset.sxZone === zone; n = n.previousElementSibling) run.unshift(n);
    } else {
      for (let n = anchor.nextElementSibling; n && n.dataset.sxZone === zone; n = n.nextElementSibling) run.push(n);
    }
    const others = run.filter((n) => n !== el);
    const next = others.find((n) => Number(n.dataset.sxOrder) > order);

    if (next) {
      if (el.nextElementSibling !== next) next.before(el);
    } else if (before) {
      if (el.nextElementSibling !== anchor) anchor.before(el);
    } else {
      const prev = others[others.length - 1] || anchor;
      if (el.previousElementSibling !== prev) prev.after(el);
    }
    return true;
  }

  // Round control button that borrows the native button classes so hover/focus styling matches.
  function button({ id, title, html, onClick }) {
    const L = layout();
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `sx-btn ${L ? L.repeatClass : ''}`;
    b.dataset.sxId = id;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.innerHTML = html;
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(e); });
    return b;
  }

  function group(children) {
    const g = document.createElement('div');
    g.className = 'sx-group';
    g.append(...children);
    return g;
  }

  return { ensure, button, group };
})();
