// Tiny event emitter shared by core and features (e.g. "trackchange").
SX.events = (() => {
  const handlers = new Map();
  return {
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name).add(fn);
      return () => handlers.get(name).delete(fn);
    },
    emit(name, payload) {
      (handlers.get(name) || []).forEach((fn) => {
        try { fn(payload); } catch (e) { console.error('[SX] handler error for', name, e); }
      });
    },
  };
})();
