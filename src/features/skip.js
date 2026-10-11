// Feature: skip back/forward buttons around play/pause.
(() => {
  const BACK = [10, 5];    // left of play/pause, shown left to right
  const FORWARD = [5, 10]; // right of play/pause

  const PATH_BACK = 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z';
  const PATH_FWD = 'M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z';

  const icon = (path, n) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/>` +
    `<text x="12" y="16.2" font-size="8" font-weight="700" text-anchor="middle" stroke="none">${n}</text></svg>`;

  let before, after;

  function build() {
    const mk = (secs, dir) => SX.ui.button({
      id: `skip${dir > 0 ? '+' : '-'}${secs}`,
      title: dir > 0 ? `Forward ${secs} seconds` : `Back ${secs} seconds`,
      html: icon(dir > 0 ? PATH_FWD : PATH_BACK, secs),
      onClick: () => SX.player.seekBy(dir * secs),
    });
    before = SX.ui.group(BACK.map((s) => mk(s, -1)));
    after = SX.ui.group(FORWARD.map((s) => mk(s, 1)));
  }

  SX.registry.register({
    id: 'skip',
    mount() {
      if (!before) build();
      SX.ui.ensure(before, 'before-playpause', 10);
      SX.ui.ensure(after, 'after-playpause', 10);
    },
  });
})();
