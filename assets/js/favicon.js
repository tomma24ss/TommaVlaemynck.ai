/**
 * Animated tab icon — mini node network with pulsing glow, matching the hero background.
 */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let link = document.querySelector("link[rel='icon'][data-dynamic]");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.setAttribute('data-dynamic', 'true');
    document.head.appendChild(link);
  }

  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const nodes = [
    { x: 16, y: 7, r: 2 },
    { x: 7, y: 23, r: 1.75 },
    { x: 25, y: 23, r: 1.75 },
    { x: 16, y: 15, r: 2.75 },
  ];

  const edges = [
    [0, 3],
    [1, 3],
    [2, 3],
    [1, 2],
  ];

  let frame = 0;

  function drawNode(node, intensity) {
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3.5);
    glow.addColorStop(0, `rgba(0, 217, 255, ${intensity * 0.55})`);
    glow.addColorStop(1, 'rgba(0, 217, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(0, 217, 255, ${0.55 + intensity * 0.45})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function render() {
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = '#0a0e14';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 6);
    ctx.fill();

    edges.forEach(([from, to], index) => {
      const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(frame * 0.06 + index * 1.4));
      ctx.strokeStyle = `rgba(0, 217, 255, ${0.12 + pulse * 0.38})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nodes[from].x, nodes[from].y);
      ctx.lineTo(nodes[to].x, nodes[to].y);
      ctx.stroke();
    });

    nodes.forEach((node, index) => {
      const hubBoost = index === 3 ? 0.15 : 0;
      const intensity = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame * 0.07 + index * 1.1)) + hubBoost;
      drawNode(node, Math.min(intensity, 1));
    });

    link.href = canvas.toDataURL('image/png');
    frame += 1;

    if (!reducedMotion && document.visibilityState === 'visible') {
      requestAnimationFrame(render);
    }
  }

  render();

  if (!reducedMotion) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        requestAnimationFrame(render);
      }
    });
  }
})();
