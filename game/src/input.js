// input.js — keyboard and mouse state, one job: know what the player did.
export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // keys pressed since last poll (edge-triggered)
  let mouse = { x: 0, y: 0, clicked: false, down: false };

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (!e.repeat) pressed.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });
  window.addEventListener('blur', () => { keys.clear(); });

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }
  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPos(e);
    mouse.x = p.x; mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = canvasPos(e);
    mouse.x = p.x; mouse.y = p.y; mouse.down = true;
  });
  window.addEventListener('mouseup', (e) => {
    const p = canvasPos(e);
    mouse.x = p.x; mouse.y = p.y;
    if (mouse.down) mouse.clicked = true;
    mouse.down = false;
  });

  return {
    down(...names) { return names.some((n) => keys.has(n)); },
    // True once per physical press; callers consume it each frame.
    wasPressed(...names) { return names.some((n) => pressed.has(n)); },
    consumeClick() {
      const c = mouse.clicked;
      mouse.clicked = false;
      return c;
    },
    mousePos() { return { x: mouse.x, y: mouse.y }; },
    endFrame() { pressed.clear(); mouse.clicked = false; },
  };
}
